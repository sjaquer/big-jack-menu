"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Target, Bomb, Trophy, Send, X } from "lucide-react";
import { saveToLeaderboard, generateHash, getPlayerRank, getRankingByCategory, getStats, CATEGORIES } from "./leaderboard";

export default function RetoGamerPage() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [showBossBar, setShowBossBar] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState({});
  const [wave, setWave] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameSessionId, setGameSessionId] = useState("");
  
  // Datos de la partida para leaderboard
  const [gameData, setGameData] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerWhatsApp, setPlayerWhatsApp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [menuPulse, setMenuPulse] = useState(false);

  // Leaderboard local
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardRankings, setLeaderboardRankings] = useState([]);
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [leaderboardCategory, setLeaderboardCategory] = useState('high_score');

  const loadLeaderboard = (category = leaderboardCategory) => {
    try {
      const data = getRankingByCategory(category, 20);
      setLeaderboardRankings(data);
      setLeaderboardStats(getStats());
    } catch (e) {
      setLeaderboardRankings([]);
      setLeaderboardStats(null);
    }
  };

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar high score con validación anti-trampas
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('bj_game_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        // Validación básica del checksum
        const expectedCheck = (data.highScore * 7 + 42) % 10000;
        if (data.check === expectedCheck && data.highScore >= 0 && data.highScore < 10000000) {
          setHighScore(data.highScore);
        }
      }
    } catch {
      localStorage.removeItem('bj_game_data');
    }
  }, []);

  // Game Engine
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width, height;

    // Generar ID de sesión único para anti-trampas
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setGameSessionId(sessionId);

    // Resize handler
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Anti-cheat: Verificar que el tiempo de frame sea razonable
    let lastFrameTime = performance.now();
    let suspiciousFrames = 0;
    const MAX_SUSPICIOUS_FRAMES = 10;

    // Game state
    const state = {
      frames: 0,
      wave: 1,
      score: 0,
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
      bossActive: false,
      bossPhase: 'none',
      // AUMENTADO: El boss ahora aparece mucho más tarde (3500 en lugar de 1200)
      nextBossScore: 3500,
      running: true,
      startTime: Date.now(),
      totalEnemiesKilled: 0,
      totalDamageTaken: 0,
      timeToBoss: 0, // Para categoría speedrun
      reachedBoss: false
    };

    const input = {
      x: width / 2,
      y: height * 0.8,
      active: false,
      keys: {}
    };

    // Entities
    let player, bullets = [], enemies = [], particles = [], stars = [], powerUps = [];
    let boss = null;

    // Power-up types
    const POWERUP_TYPES = {
      SHIELD: { color: '#0ff', icon: '🛡️', duration: 300, name: 'Escudo' },
      SPEED: { color: '#ff0', icon: '⚡', duration: 400, name: 'Velocidad' },
      TRIPLE: { color: '#f0f', icon: '🔥', duration: 350, name: 'Triple Disparo' },
      BOMB: { color: '#f00', icon: '💣', duration: 1, name: 'Bomba' },
      HEAL: { color: '#0f0', icon: '❤️', duration: 1, name: 'Vida' }
    };

    // Star class
    class Star {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 2 + 0.5;
        this.brightness = Math.random() * 0.5 + 0.3;
      }
      update() {
        this.y += this.speed;
        if (this.y > height) {
          this.y = 0;
          this.x = Math.random() * width;
        }
      }
      draw() {
        ctx.fillStyle = `rgba(255, 200, 100, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // PowerUp class
    class PowerUp {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = POWERUP_TYPES[type];
        this.radius = 18;
        this.active = true;
        this.tick = 0;
        this.vy = 1.5;
      }
      update() {
        this.y += this.vy;
        this.tick++;
        if (this.y > height + 50) this.active = false;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Glow effect
        ctx.shadowBlur = 20 + Math.sin(this.tick * 0.1) * 5;
        ctx.shadowColor = this.config.color;
        
        // Outer ring
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + Math.sin(this.tick * 0.15) * 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner circle
        ctx.fillStyle = this.config.color + '40';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, 0, 0);
        
        ctx.restore();
      }
    }

    // Player class
    class Player {
      constructor() {
        this.x = width / 2;
        this.y = height * 0.85;
        this.radius = isMobile ? 6 : 5;
        this.baseSpeed = isMobile ? 9 : 11;
        this.speed = this.baseSpeed;
        this.hp = 100;
        this.maxHp = 100;
        this.lastShot = 0;
        this.shootDelay = isMobile ? 7 : 5;
        this.powerUps = {};
        this.invincible = 0;
      }

      update() {
        // Update power-ups
        Object.keys(this.powerUps).forEach(key => {
          if (this.powerUps[key] > 0) {
            this.powerUps[key]--;
            if (this.powerUps[key] <= 0) {
              delete this.powerUps[key];
              updateActivePowerUps();
            }
          }
        });

        // Speed boost from power-up
        this.speed = this.powerUps.SPEED ? this.baseSpeed * 1.5 : this.baseSpeed;

        let dx = 0, dy = 0;
        if (input.keys.w || input.keys.arrowup) dy -= 1;
        if (input.keys.s || input.keys.arrowdown) dy += 1;
        if (input.keys.a || input.keys.arrowleft) dx -= 1;
        if (input.keys.d || input.keys.arrowright) dx += 1;

        if (dx !== 0 || dy !== 0) {
          const len = Math.sqrt(dx * dx + dy * dy);
          this.x += (dx / len) * this.speed;
          this.y += (dy / len) * this.speed;
          input.active = false;
        } else if (input.active) {
          // Smoother mouse/touch following
          const followSpeed = isMobile ? 0.12 : 0.18;
          this.x += (input.x - this.x) * followSpeed;
          this.y += (input.y - this.y) * followSpeed;
        }

        this.x = Math.max(25, Math.min(width - 25, this.x));
        this.y = Math.max(25, Math.min(height - 25, this.y));

        // Invincibility frames
        if (this.invincible > 0) this.invincible--;

        // Auto-shoot
        const currentShootDelay = this.powerUps.TRIPLE ? this.shootDelay * 0.6 : this.shootDelay;
        if (state.frames - this.lastShot > currentShootDelay) {
          // Base shots
          bullets.push(new Bullet(this.x - 8, this.y - 15, 0, -22, 'player'));
          bullets.push(new Bullet(this.x + 8, this.y - 15, 0, -22, 'player'));
          
          // Triple shot power-up
          if (this.powerUps.TRIPLE) {
            bullets.push(new Bullet(this.x, this.y - 15, -4, -20, 'player'));
            bullets.push(new Bullet(this.x, this.y - 15, 4, -20, 'player'));
            bullets.push(new Bullet(this.x, this.y - 20, 0, -24, 'player_strong'));
          }
          
          // Wave bonus shots
          if (state.wave >= 2) {
            bullets.push(new Bullet(this.x - 12, this.y - 10, -2, -20, 'player'));
            bullets.push(new Bullet(this.x + 12, this.y - 10, 2, -20, 'player'));
          }
          this.lastShot = state.frames;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Shield effect
        if (this.powerUps.SHIELD) {
          ctx.strokeStyle = '#0ff';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#0ff';
          ctx.beginPath();
          ctx.arc(0, 0, 28 + Math.sin(state.frames * 0.1) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Speed trail
        if (this.powerUps.SPEED) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = '#ff0';
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.ellipse(0, 10 * i, 15 - i * 3, 8 - i * 2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        
        // Invincibility flash
        if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        }
        
        // Glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.powerUps.TRIPLE ? '#f0f' : '#ffa500';

        // Ship body (burger style)
        ctx.fillStyle = '#fa0';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Top bun
        ctx.fillStyle = '#f80';
        ctx.beginPath();
        ctx.ellipse(0, -5, 15, 8, 0, Math.PI, 0);
        ctx.fill();

        // Lettuce
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = -12; i <= 12; i += 4) {
          ctx.lineTo(i, Math.sin(i * 0.5 + state.frames * 0.1) * 2);
        }
        ctx.stroke();

        // Hitbox indicator
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Engine flames
        const flameHeight = 10 + Math.random() * 10 + (this.powerUps.SPEED ? 8 : 0);
        ctx.fillStyle = this.powerUps.SPEED ? '#ff0' : '#f00';
        ctx.beginPath();
        ctx.moveTo(-8, 10);
        ctx.lineTo(0, 10 + flameHeight);
        ctx.lineTo(8, 10);
        ctx.fill();

        ctx.restore();
      }

      hit(dmg) {
        if (this.invincible > 0) return;
        if (this.powerUps.SHIELD) {
          delete this.powerUps.SHIELD;
          updateActivePowerUps();
          createParticles(this.x, this.y, 15, '#0ff');
          this.invincible = 30;
          return;
        }
        
        this.hp -= dmg;
        state.totalDamageTaken += dmg;
        state.combo = 0;
        state.comboTimer = 0;
        setCombo(0);
        createParticles(this.x, this.y, 10, '#f00');
        setHealth(Math.max(0, this.hp));
        this.invincible = 60;
        
        if (this.hp <= 0) {
          endGame();
        }
      }

      activatePowerUp(type) {
        const config = POWERUP_TYPES[type];
        
        if (type === 'BOMB') {
          // Clear all enemy bullets and damage enemies
          bullets = bullets.filter(b => b.type === 'player' || b.type === 'player_strong');
          enemies.forEach(e => {
            e.hp -= 50;
            if (e.hp <= 0) {
              e.active = false;
              state.score += 100;
              createParticles(e.x, e.y, 10, '#f00');
            }
          });
          if (boss && state.bossPhase === 'fighting') {
            boss.takeDamage(100);
          }
          createParticles(this.x, this.y, 50, '#f00');
          createParticles(this.x, this.y, 30, '#ff0');
        } else if (type === 'HEAL') {
          this.hp = Math.min(this.maxHp, this.hp + 30);
          setHealth(this.hp);
          createParticles(this.x, this.y, 20, '#0f0');
        } else {
          this.powerUps[type] = config.duration;
        }
        
        updateActivePowerUps();
        state.score += 50;
        setScore(state.score);
      }
    }

    function updateActivePowerUps() {
      const active = {};
      if (player?.powerUps) {
        Object.keys(player.powerUps).forEach(key => {
          if (player.powerUps[key] > 0) {
            active[key] = true;
          }
        });
      }
      setActivePowerUps(active);
    }

    // Boss class - FIXED movement and improved patterns
    class Boss {
      constructor(difficulty) {
        this.x = width / 2;
        this.y = -150;
        this.targetY = height * 0.18;
        this.radius = isMobile ? 50 : 70;
        this.hp = 600 + (400 * difficulty);
        this.maxHp = this.hp;
        this.tick = 0;
        this.phase = 0; // Different attack phases
        this.moveAngle = 0; // For smooth movement
        this.targetX = width / 2;
        this.patternTimer = 0;
        this.currentPattern = 0;
        this.enraged = false;
        setBossMaxHealth(this.maxHp);
        setBossHealth(this.hp);
      }

      update() {
        this.tick++;
        
        if (state.bossPhase === 'entering') {
          this.y += (this.targetY - this.y) * 0.025;
          if (Math.abs(this.y - this.targetY) < 5) {
            this.y = this.targetY;
            state.bossPhase = 'fighting';
            setShowBossBar(true);
          }
          return;
        }

        // Enrage at low HP
        if (this.hp < this.maxHp * 0.3 && !this.enraged) {
          this.enraged = true;
          setWarningText("¡JACK ESTÁ FURIOSO!");
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 1500);
        }

        // FIXED: Smooth sinusoidal movement without teleporting
        this.moveAngle += this.enraged ? 0.025 : 0.018;
        const targetX = (width / 2) + Math.sin(this.moveAngle) * (width * 0.32);
        this.x += (targetX - this.x) * 0.05; // Smooth interpolation

        // Slight vertical bob
        this.y = this.targetY + Math.sin(this.tick * 0.04) * 15;

        // Pattern rotation
        this.patternTimer++;
        const patternDuration = this.enraged ? 150 : 200;
        if (this.patternTimer > patternDuration) {
          this.patternTimer = 0;
          this.currentPattern = (this.currentPattern + 1) % 5;
        }

        // Execute current attack pattern
        const attackSpeed = this.enraged ? 0.7 : 1;
        
        switch (this.currentPattern) {
          case 0: // Fries spray
            if (this.tick % Math.floor(18 * attackSpeed) === 0) this.shootFriesSpray();
            break;
          case 1: // Pickle spiral
            if (this.tick % Math.floor(8 * attackSpeed) === 0) this.shootPickleSpiral();
            break;
          case 2: // Burger wave
            if (this.tick % Math.floor(60 * attackSpeed) === 0) this.shootBurgerWave();
            if (this.tick % Math.floor(25 * attackSpeed) === 0) this.shootAimedFries();
            break;
          case 3: // Cheese rain
            if (this.tick % Math.floor(12 * attackSpeed) === 0) this.shootCheeseRain();
            break;
          case 4: // Combo attack
            if (this.tick % Math.floor(15 * attackSpeed) === 0) this.shootAimedFries();
            if (this.tick % Math.floor(40 * attackSpeed) === 0) this.shootPickleSpiral();
            break;
        }

        // Enrage bonus attacks
        if (this.enraged && this.tick % 50 === 0) {
          this.shootBurgerWave();
        }
      }

      shootFriesSpray() {
        const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
        const spread = this.enraged ? 5 : 3;
        for (let i = -spread; i <= spread; i++) {
          bullets.push(new Bullet(
            this.x, this.y + 40,
            Math.cos(baseAngle + i * 0.12) * 6,
            Math.sin(baseAngle + i * 0.12) * 6,
            'enemy_fries'
          ));
        }
      }

      shootAimedFries() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        for (let i = -1; i <= 1; i++) {
          bullets.push(new Bullet(
            this.x + i * 30, this.y + 40,
            Math.cos(angle) * 8,
            Math.sin(angle) * 8,
            'enemy_fries'
          ));
        }
      }

      shootPickleSpiral() {
        const count = this.enraged ? 8 : 6;
        for (let i = 0; i < count; i++) {
          const angle = (this.tick * 0.06) + (Math.PI * 2 / count) * i;
          bullets.push(new Bullet(
            this.x, this.y,
            Math.cos(angle) * 4.5,
            Math.sin(angle) * 4.5,
            'enemy_pickle'
          ));
        }
      }

      shootBurgerWave() {
        const count = this.enraged ? 16 : 12;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 / count) * i;
          bullets.push(new Bullet(
            this.x, this.y,
            Math.cos(angle) * 3,
            Math.sin(angle) * 3,
            'enemy_burger'
          ));
        }
      }

      shootCheeseRain() {
        // Random cheese drops from boss position
        for (let i = 0; i < 3; i++) {
          const offsetX = (Math.random() - 0.5) * 120;
          bullets.push(new Bullet(
            this.x + offsetX, this.y + 50,
            (Math.random() - 0.5) * 2,
            4 + Math.random() * 2,
            'enemy_cheese'
          ));
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        const bob = Math.sin(this.tick * 0.06) * 6;
        ctx.translate(0, bob);

        // Enrage glow
        ctx.shadowBlur = this.enraged ? 60 : 40;
        ctx.shadowColor = this.enraged ? '#f00' : '#fa0';

        const scale = isMobile ? 0.8 : 1;
        
        // Top bun
        ctx.fillStyle = this.enraged ? '#f60' : '#fa0';
        ctx.beginPath();
        ctx.ellipse(0, -25 * scale, 65 * scale, 35 * scale, 0, Math.PI, 0);
        ctx.fill();

        // Sesame seeds
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.ellipse(-30 * scale + i * 15 * scale, -40 * scale, 4, 2, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Lettuce
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let i = -60 * scale; i <= 60 * scale; i += 8) {
          ctx.lineTo(i, -20 * scale + Math.sin(i * 0.2 + this.tick * 0.1) * 6);
        }
        ctx.stroke();

        // Patty
        ctx.fillStyle = this.enraged ? '#600' : '#800';
        ctx.beginPath();
        ctx.ellipse(0, 0, 60 * scale, 18 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cheese drip
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.moveTo(-50 * scale, 5 * scale);
        ctx.lineTo(-45 * scale, 20 * scale);
        ctx.lineTo(-35 * scale, 5 * scale);
        ctx.lineTo(0, 25 * scale);
        ctx.lineTo(35 * scale, 5 * scale);
        ctx.lineTo(45 * scale, 18 * scale);
        ctx.lineTo(50 * scale, 5 * scale);
        ctx.fill();

        // Bottom bun
        ctx.fillStyle = this.enraged ? '#f60' : '#fa0';
        ctx.beginPath();
        ctx.ellipse(0, 30 * scale, 55 * scale, 25 * scale, 0, 0, Math.PI);
        ctx.fill();

        // Evil eyes
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f00';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-20 * scale, -35 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.arc(20 * scale, -35 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Pupils that track player
        const eyeAngle = Math.atan2(player.y - this.y, player.x - this.x);
        const pupilDist = 4 * scale;
        ctx.fillStyle = this.enraged ? '#f00' : '#800';
        ctx.beginPath();
        ctx.arc(-20 * scale + Math.cos(eyeAngle) * pupilDist, -35 * scale + Math.sin(eyeAngle) * pupilDist, 6 * scale, 0, Math.PI * 2);
        ctx.arc(20 * scale + Math.cos(eyeAngle) * pupilDist, -35 * scale + Math.sin(eyeAngle) * pupilDist, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Evil smile/angry mouth
        ctx.strokeStyle = this.enraged ? '#f00' : '#000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (this.enraged) {
          // Angry grimace
          ctx.moveTo(-25 * scale, -10 * scale);
          ctx.lineTo(-15 * scale, -15 * scale);
          ctx.lineTo(15 * scale, -15 * scale);
          ctx.lineTo(25 * scale, -10 * scale);
        } else {
          ctx.arc(0, -15 * scale, 30 * scale, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();

        ctx.restore();
      }

      takeDamage(amt) {
        if (state.bossPhase !== 'fighting') return;
        this.hp -= amt;
        setBossHealth(Math.max(0, this.hp));
        
        // Combo system
        state.combo++;
        if (state.combo > state.maxCombo) {
          state.maxCombo = state.combo;
          setMaxCombo(state.maxCombo);
        }
        state.comboTimer = 60;
        setCombo(state.combo);

        if (this.hp <= 0) {
          createParticles(this.x, this.y, 80, '#fa0');
          createParticles(this.x, this.y, 80, '#f00');
          createParticles(this.x, this.y, 40, '#ff0');
          
          // Boss kill bonus
          const bossBonus = 3000 + (state.combo * 10);
          state.score += bossBonus;
          setScore(state.score);
          setShowBossBar(false);
          state.bossActive = false;
          boss = null;
          state.bossPhase = 'none';
          // AUMENTADO: Siguiente boss requiere más puntos
          state.nextBossScore = state.score + 4000 + (state.wave * 1000);
          state.wave++;
          setWave(state.wave);
          
          // Drop power-ups on boss death
          spawnPowerUp(this.x - 40, this.y);
          spawnPowerUp(this.x + 40, this.y);
          spawnPowerUp(this.x, this.y - 30);
        }
      }
    }

    // Bullet class - Added cheese type
    class Bullet {
      constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.active = true;
        this.tick = 0;

        switch (type) {
          case 'player':
            this.radius = 4;
            this.color = '#fa0';
            break;
          case 'player_strong':
            this.radius = 6;
            this.color = '#f0f';
            break;
          case 'enemy_fries':
            this.radius = 4;
            this.color = '#ff0';
            break;
          case 'enemy_pickle':
            this.radius = 6;
            this.color = '#0f0';
            break;
          case 'enemy_burger':
            this.radius = 10;
            this.color = '#f00';
            break;
          case 'enemy_cheese':
            this.radius = 8;
            this.color = '#ff0';
            break;
          default:
            this.radius = 5;
            this.color = '#f0f';
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.tick++;
        
        // Cheese falls with slight wobble
        if (this.type === 'enemy_cheese') {
          this.x += Math.sin(this.tick * 0.1) * 0.5;
        }
        
        if (this.x < -30 || this.x > width + 30 || this.y < -30 || this.y > height + 30) {
          this.active = false;
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();

        if (this.type === 'enemy_fries') {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
          ctx.stroke();
        }
        
        if (this.type === 'player_strong') {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }

    // Particle class
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 14;
        this.vy = (Math.random() - 0.5) * 14;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 5 + 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.life -= 0.022;
      }
      draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
      }
    }

    // Helper functions
    function createParticles(x, y, count, color) {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
      }
    }

    function spawnPowerUp(x, y) {
      const types = Object.keys(POWERUP_TYPES);
      const weights = [3, 3, 2, 1, 2]; // Shield, Speed, Triple, Bomb, Heal
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < types.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          powerUps.push(new PowerUp(x, y, types[i]));
          break;
        }
      }
    }

    function checkCollisions() {
      // Player bullets vs boss/enemies
      bullets.filter(b => b.type === 'player' || b.type === 'player_strong').forEach(b => {
        const damage = b.type === 'player_strong' ? 25 : 15;
        
        if (boss && state.bossPhase === 'fighting') {
          const dist = Math.hypot(b.x - boss.x, b.y - boss.y);
          if (dist < boss.radius + 15) {
            boss.takeDamage(damage);
            b.active = false;
            createParticles(b.x, b.y, 3, '#fa0');
          }
        }
        enemies.forEach(e => {
          const dist = Math.hypot(b.x - e.x, b.y - e.y);
          if (dist < e.radius + 8) {
            e.hp -= damage;
            b.active = false;
            
            // Combo system
            state.combo++;
            if (state.combo > state.maxCombo) {
              state.maxCombo = state.combo;
              setMaxCombo(state.maxCombo);
            }
            state.comboTimer = 60;
            setCombo(state.combo);
            
            if (e.hp <= 0) {
              e.active = false;
              state.totalEnemiesKilled++;
              const comboBonus = Math.min(state.combo, 50) * 2;
              state.score += 100 + comboBonus;
              setScore(state.score);
              createParticles(e.x, e.y, 14, e.color);
              
              // Random power-up drop (10% chance)
              if (Math.random() < 0.1) {
                spawnPowerUp(e.x, e.y);
              }
            }
          }
        });
      });

      // Enemy bullets vs player
      bullets.filter(b => b.type !== 'player' && b.type !== 'player_strong').forEach(b => {
        const dist = Math.hypot(b.x - player.x, b.y - player.y);
        if (dist < player.radius + b.radius) {
          player.hit(10);
          b.active = false;
        } else if (dist < player.radius + b.radius + 20) {
          // Graze bonus
          state.score += 3;
          setScore(state.score);
        }
      });

      // Power-up collection
      powerUps.forEach(p => {
        const dist = Math.hypot(p.x - player.x, p.y - player.y);
        if (dist < player.radius + p.radius) {
          player.activatePowerUp(p.type);
          p.active = false;
          createParticles(p.x, p.y, 15, p.config.color);
        }
      });
    }

    function spawnEnemies() {
      if (state.bossPhase !== 'none') return;

      if (state.score >= state.nextBossScore && !state.bossActive) {
        startBossSequence();
        return;
      }

      const spawnRate = Math.max(30, 50 - state.wave * 3);
      if (state.frames % spawnRate === 0) {
        const types = ['drone', 'spinner', 'kamikaze'];
        const type = types[Math.floor(Math.random() * (state.wave >= 2 ? 3 : 2))];
        
        enemies.push({
          x: Math.random() * (width - 100) + 50,
          y: -40,
          active: true,
          type,
          hp: type === 'kamikaze' ? 15 : 30,
          radius: type === 'kamikaze' ? 18 : 22,
          color: type === 'drone' ? '#f0f' : type === 'spinner' ? '#0ff' : '#f80',
          tick: 0,
          update() {
            this.tick++;
            
            if (this.type === 'kamikaze') {
              // Chase player
              const angle = Math.atan2(player.y - this.y, player.x - this.x);
              this.x += Math.cos(angle) * 3.5;
              this.y += Math.sin(angle) * 3.5;
            } else {
              this.y += 2.5;
            }
            
            if (this.type === 'drone' && this.tick % 60 === 0) {
              const angle = Math.atan2(player.y - this.y, player.x - this.x);
              bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * 5.5, Math.sin(angle) * 5.5, 'enemy'));
            }
            
            if (this.type === 'spinner' && this.tick % 40 === 0) {
              for (let i = 0; i < 4; i++) {
                const angle = (this.tick * 0.05) + (Math.PI / 2) * i;
                bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * 4, Math.sin(angle) * 4, 'enemy'));
              }
            }
            
            if (this.y > height + 50 || this.x < -50 || this.x > width + 50) this.active = false;
          }
        });
      }
    }

    function startBossSequence() {
      state.bossActive = true;
      state.bossPhase = 'warning';
      setWarningText("JACK TIENE HAMBRE");
      setShowWarning(true);
      
      // Registrar tiempo hasta el boss (para categoría speedrun)
      if (!state.reachedBoss) {
        state.timeToBoss = (Date.now() - state.startTime) / 1000;
        state.reachedBoss = true;
      }

      enemies.forEach(e => {
        createParticles(e.x, e.y, 5, '#fff');
        e.active = false;
      });
      
      // Clear enemy bullets for fairness
      bullets = bullets.filter(b => b.type === 'player' || b.type === 'player_strong');

      setTimeout(() => {
        setShowWarning(false);
        state.bossPhase = 'entering';
        boss = new Boss(state.wave);
      }, 2500);
    }

    function endGame() {
      state.running = false;
      const finalScore = state.score;
      const duration = (Date.now() - state.startTime) / 1000;
      
      // Guardar datos de la partida para el leaderboard
      const gameDataForLeaderboard = {
        score: finalScore,
        wave: state.wave,
        kills: state.totalEnemiesKilled,
        duration: duration,
        timeToBoss: state.timeToBoss || 0,
        maxCombo: state.maxCombo,
        sessionId: sessionId,
        hash: ''
      };
      gameDataForLeaderboard.hash = generateHash(gameDataForLeaderboard);
      setGameData(gameDataForLeaderboard);
      
      // Anti-cheat validation
      const gameTime = duration;
      const maxPossibleScore = gameTime * 200; // Max ~200 points per second
      const isValid = finalScore < maxPossibleScore && 
                      state.totalEnemiesKilled * 200 >= finalScore * 0.5 &&
                      suspiciousFrames < MAX_SUSPICIOUS_FRAMES;
      
      if (finalScore > highScore && isValid) {
        setHighScore(finalScore);
        // Save with checksum for basic anti-tamper
        const check = (finalScore * 7 + 42) % 10000;
        localStorage.setItem('bj_game_data', JSON.stringify({
          highScore: finalScore,
          check,
          date: Date.now(),
          wave: state.wave,
          kills: state.totalEnemiesKilled
        }));
      }
      
      // Guardado automático en leaderboard usando los datos de la partida
      try {
        const entry = saveToLeaderboard({
          playerName: 'Jugador',
          whatsapp: '',
          ...gameDataForLeaderboard
        });
        setRedeemCode(entry?.redeemCode || '');
        setSubmitSuccess(true);
        setShowRegisterModal(false);
      } catch (e) {
        console.error('Error saving leaderboard on gameover:', e);
      }

      // Animar y regresar al menú en unos segundos
      setMenuPulse(true);
      setTimeout(() => setMenuPulse(false), 2500);
      setTimeout(() => goToMenu(), 3500);

      setGameState('gameover');
    }

    // Initialize
    function init() {
      player = new Player();
      bullets = [];
      enemies = [];
      particles = [];
      stars = [];
      powerUps = [];
      boss = null;

      for (let i = 0; i < 80; i++) {
        stars.push(new Star());
      }

      state.score = 0;
      state.frames = 0;
      state.wave = 1;
      state.combo = 0;
      state.maxCombo = 0;
      state.comboTimer = 0;
      state.bossActive = false;
      state.bossPhase = 'none';
      // AUMENTADO: Boss aparece más tarde (3500 puntos)
      state.nextBossScore = 3500;
      state.running = true;
      state.startTime = Date.now();
      state.totalEnemiesKilled = 0;
      state.totalDamageTaken = 0;
      state.timeToBoss = 0;
      state.reachedBoss = false;
      suspiciousFrames = 0;

      setScore(0);
      setHealth(100);
      setShowBossBar(false);
      setBossHealth(0);
      setWave(1);
      setCombo(0);
      setMaxCombo(0);
      setActivePowerUps({});
      setGameData(null);
      setShowRegisterModal(false);
      setSubmitSuccess(false);
      setRedeemCode("");
    }

    // Game loop
    function loop() {
      if (!state.running) return;

      // Anti-cheat: Frame time validation
      const now = performance.now();
      const deltaTime = now - lastFrameTime;
      if (deltaTime < 10 || deltaTime > 200) { // Too fast or too slow
        suspiciousFrames++;
      }
      lastFrameTime = now;

      // Combo decay
      if (state.comboTimer > 0) {
        state.comboTimer--;
        if (state.comboTimer <= 0) {
          state.combo = 0;
          setCombo(0);
        }
      }

      // Clear with fade
      ctx.fillStyle = 'rgba(5, 5, 15, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Stars
      stars.forEach(s => {
        s.update();
        s.draw();
      });

      // Player
      player.update();
      player.draw();

      // Power-ups
      powerUps.forEach(p => {
        p.update();
        p.draw();
      });
      powerUps = powerUps.filter(p => p.active);

      // Spawn enemies
      spawnEnemies();

      // Boss
      if (boss) {
        boss.update();
        boss.draw();
      }

      // Enemies
      enemies.forEach(e => {
        e.update();
        if (e.active) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 15;
          ctx.shadowColor = e.color;
          ctx.stroke();
          
          // Inner detail based on type
          ctx.beginPath();
          if (e.type === 'kamikaze') {
            // Kamikaze has a fire core
            ctx.arc(e.x, e.y, e.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#f00';
          } else {
            ctx.arc(e.x, e.y, e.radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = e.color;
          }
          ctx.globalAlpha = 0.4;
          ctx.fill();
          ctx.restore();
        }
      });
      enemies = enemies.filter(e => e.active);

      // Bullets
      bullets.forEach(b => {
        b.update();
        b.draw();
      });
      bullets = bullets.filter(b => b.active);

      // Particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      particles = particles.filter(p => p.life > 0);

      // Collisions
      checkCollisions();

      state.frames++;
      animationId = requestAnimationFrame(loop);
    }

    // Input handlers
    const handleKeyDown = (e) => {
      input.keys[e.key.toLowerCase()] = true;
      input.active = false;
    };
    const handleKeyUp = (e) => {
      input.keys[e.key.toLowerCase()] = false;
    };
    const handleMove = (x, y) => {
      input.x = x;
      input.y = y;
      input.active = true;
    };
    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchMove, { passive: false });

    // Start
    init();
    loop();

    // Cleanup
    return () => {
      state.running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
    };
  }, [gameState, isMobile, highScore]);

  const startGame = useCallback(() => {
    setGameState('playing');
  }, []);

  const goToMenu = useCallback(() => {
    setGameState('menu');
  }, []);

  // Función para registrar el score en el leaderboard
  const handleSubmitScore = useCallback(async () => {
    if (!playerName.trim() || !gameData) return;
    
    setIsSubmitting(true);
    
    try {
      // Guardar en el leaderboard
      const entry = saveToLeaderboard({
        playerName: playerName.trim(),
        whatsapp: playerWhatsApp.trim(),
        ...gameData
      });
      
      // Actualizar estados
      setRedeemCode(entry.redeemCode);
      setSubmitSuccess(true);
      setShowRegisterModal(false);
      
    } catch (error) {
      console.error('Error al guardar score:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [playerName, playerWhatsApp, gameData]);

  // Guardado automático al terminar la partida (usa defaults si no hay nombre)
  const autoSaveScore = useCallback(() => {
    if (!gameData) return null;

    try {
      const entry = saveToLeaderboard({
        playerName: 'Jugador',
        whatsapp: '',
        ...gameData
      });

      setRedeemCode(entry.redeemCode);
      setSubmitSuccess(true);
      setShowRegisterModal(false);
      return entry;
    } catch (e) {
      console.error('Auto-save error:', e);
      return null;
    }
  }, [gameData]);

  // Power-up icons for HUD
  const powerUpIcons = {
    SHIELD: { icon: Shield, color: 'text-cyan-400' },
    SPEED: { icon: Zap, color: 'text-yellow-400' },
    TRIPLE: { icon: Target, color: 'text-fuchsia-400' }
  };

  return (
    <div className="fixed inset-0 bg-[#020204] overflow-hidden select-none">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${gameState !== 'playing' ? 'opacity-30' : ''}`}
      />

      {/* HUD - Solo visible durante el juego */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none z-10">
          <div className="flex justify-between items-start">
            <div>
              {/* Score */}
              <div className="text-white font-mono text-lg sm:text-2xl font-bold drop-shadow-[0_0_10px_rgba(217,145,51,0.8)]">
                PUNTOS: {score.toLocaleString()}
              </div>

              {/* Combo indicator */}
              {combo > 0 && (
                <div className={`text-[#d99133] font-mono text-sm sm:text-lg font-bold mt-1 ${combo > 10 ? 'animate-pulse' : ''}`}>
                  🔥 COMBO x{combo}
                </div>
              )}

              {/* Health bar */}
              <div className="w-40 sm:w-56 h-3 sm:h-4 mt-2 border-2 border-cyan-400 rounded-full overflow-hidden bg-black/50 shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                  style={{ width: `${health}%` }}
                />
              </div>

              {/* Active power-ups */}
              <div className="flex gap-2 mt-2">
                {Object.entries(activePowerUps).map(([key]) => {
                  const config = powerUpIcons[key];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div key={key} className={`${config.color} animate-pulse`}>
                      <Icon size={20} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wave indicator */}
            <div className="text-right">
              <div className="text-[#d99133] font-mono text-sm sm:text-base font-bold">
                OLEADA {wave}
              </div>
            </div>
          </div>

          {/* Boss health bar */}
          {showBossBar && (
            <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[75%] max-w-md">
              <div className="text-center text-red-500 font-bold text-sm sm:text-base mb-1 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                🍔 JACK EL PARRILLERO 🍔
              </div>
              <div className="h-4 sm:h-5 border-2 border-red-500 rounded bg-red-900/50 overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-100"
                  style={{ width: `${(bossHealth / bossMaxHealth) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning overlay */}
      {showWarning && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-3xl sm:text-5xl md:text-6xl font-black text-red-500 animate-pulse text-center px-4 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">
            ⚠️ PELIGRO ⚠️<br/>
            <span className="text-2xl sm:text-4xl">{warningText || "JACK TIENE HAMBRE"}</span>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#020204]/90 backdrop-blur-sm p-4">
          <Link
            href="/"
            className="absolute top-4 left-4 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-semibold">Volver al menú</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-2 bg-gradient-to-r from-[#d99133] via-[#b07020] to-[#8a5010] bg-clip-text text-transparent drop-shadow-lg">
              NEON BURGER
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#d99133] mb-4 drop-shadow-[0_0_20px_rgba(217,145,51,0.4)]">
              HELL 🔥
            </h2>

            {highScore > 0 && (
              <div className="text-[#d99133] font-mono text-lg sm:text-xl mb-4">
                🏆 RÉCORD: {highScore.toLocaleString()}
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#d99133] to-[#b07020] hover:from-[#eeb055] hover:to-[#d99133] text-black font-black text-xl sm:text-2xl rounded-2xl shadow-[0_0_30px_rgba(217,145,51,0.5)] hover:shadow-[0_0_50px_rgba(217,145,51,0.7)] transition-all active:scale-95 uppercase tracking-wider"
            >
              🎮 INSERTAR MONEDA
            </button>

            {/* Ver ranking (modal local) */}
            <button
              onClick={() => { loadLeaderboard('high_score'); setShowLeaderboard(true); }}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-[#d99133] font-bold rounded-xl transition-all"
            >
              <Trophy size={18} />
              Ver Ranking
            </button>

            {/* Power-up legend */}
            <div className="mt-6 p-4 bg-black/50 rounded-xl border border-neutral-700 max-w-xs mx-auto">
              <p className="text-neutral-400 text-xs mb-2 font-bold">POWER-UPS:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-cyan-400">
                  <Shield size={14} /> Escudo
                </div>
                <div className="flex items-center gap-1 text-[#d99133]">
                  <Zap size={14} /> Velocidad
                </div>
                <div className="flex items-center gap-1 text-fuchsia-400">
                  <Target size={14} /> Triple Disparo
                </div>
                <div className="flex items-center gap-1 text-red-400">
                  <Bomb size={14} /> Bomba
                </div>
              </div>
            </div>



            <div className="mt-4 text-neutral-500 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
              <p className="mb-2">
                {isMobile ? '👆 TOCA para mover' : '🖱️ MOUSE / ⌨️ WASD para mover'}
              </p>
              <p>Esquiva las papas fritas 🍟 | ¡Destruye a JACK! 🍔</p>
            </div>
          </div>

          <div className="absolute bottom-4 text-neutral-600 text-xs">
            Reto Gamer Big Jack 2024 🍔
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && !showRegisterModal && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#020204]/90 backdrop-blur-sm p-4 overflow-y-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-[#d99133] mb-3 drop-shadow-[0_0_20px_rgba(217,145,51,0.8)]">
            GAME OVER
          </h1>

          <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
            PUNTUACIÓN: <span className="text-[#d99133]">{score.toLocaleString()}</span>
          </div>

          <div className="text-neutral-400 text-sm mb-2 flex flex-wrap gap-2 justify-center">
            <span>Oleada: {wave}</span>
            <span>•</span>
            <span>Combo máx: {maxCombo}</span>
            {gameData?.timeToBoss > 0 && (
              <>
                <span>•</span>
                <span>Boss en: {Math.floor(gameData.timeToBoss)}s</span>
              </>
            )}
          </div>

          {score >= highScore && score > 0 && (
            <div className="text-lg text-green-400 font-bold mb-3 animate-pulse">
              🎉 ¡NUEVO RÉCORD PERSONAL! 🎉
            </div>
          )}

          {/* Botón para registrar score */}
          {score >= 1000 && !submitSuccess && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="mb-4 px-6 py-3 bg-gradient-to-r from-[#d99133] to-[#b07020] hover:from-[#eeb055] hover:to-[#d99133] text-black font-black text-base rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <Trophy size={20} />
              ¡REGISTRAR EN RANKING!
            </button>
          )}

          {submitSuccess && redeemCode && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-center max-w-sm">
              <p className="text-green-400 font-bold mb-2">✅ ¡Registrado exitosamente!</p>
              <p className="text-xs text-neutral-400 mb-2">Tu código de participación:</p>
              <p className="text-lg font-mono text-[#d99133] bg-black/50 p-2 rounded">{redeemCode}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-green-500/50 transition-all active:scale-95"
            >
              🔄 REINTENTAR
            </button>
            <button
              onClick={goToMenu}
              className={`px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-lg rounded-xl border-2 border-neutral-600 transition-all active:scale-95 ${menuPulse ? 'animate-bounce ring-2 ring-[#d99133]/30' : ''}`}
            >
              📋 MENÚ
            </button>
          </div>

            <div className="flex gap-4 mt-4">
            <button
              onClick={() => { loadLeaderboard('high_score'); setShowLeaderboard(true); }}
              className="text-[#d99133] hover:text-[#eeb055] font-semibold transition-colors flex items-center gap-1"
            >
              <Trophy size={16} /> Ver Ranking
            </button>
            <Link
              href="/"
              className="text-neutral-400 hover:text-white font-semibold transition-colors"
            >
              🍔 Menú Big Jack
            </Link>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-[#020204]/90 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full border border-neutral-700 relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-[#d99133] mb-2 flex items-center gap-2">
              <Trophy size={24} /> Registrar Score
            </h2>
            
            <p className="text-neutral-400 text-sm mb-4">
              ¡Tu puntuación: <span className="text-[#d99133] font-bold">{score.toLocaleString()}</span>!
              <br />Completa tus datos para participar.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Nombre / Apodo *</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre para el ranking"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#d99133]"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">WhatsApp (para contactarte si ganas)</label>
                <input
                  type="tel"
                  value={playerWhatsApp}
                  onChange={(e) => setPlayerWhatsApp(e.target.value)}
                  placeholder="9XX XXX XXX"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#d99133]"
                  maxLength={15}
                />
              </div>

              <button
                onClick={handleSubmitScore}
                disabled={!playerName.trim() || isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#d99133] to-[#b07020] hover:from-[#eeb055] hover:to-[#d99133] disabled:from-neutral-600 disabled:to-neutral-600 text-black disabled:text-neutral-400 font-black text-lg rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin text-xl">🍔</div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    REGISTRAR PUNTUACIÓN
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-neutral-600 mt-4 text-center">
              Al registrarte aceptas participar en el Reto Gamer Big Jack
            </p>
          </div>
        </div>
      )}

        {/* Leaderboard Modal (local) */}
        {showLeaderboard && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#020204]/90 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 rounded-2xl p-6 max-w-4xl w-full border border-neutral-700 relative">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-[#d99133]">🏆 RANKING (Récord local)</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { loadLeaderboard('high_score'); }} className="px-3 py-1 bg-neutral-800 rounded text-sm">Actualizar</button>
                </div>
              </div>

              <div className="mb-4 text-neutral-400">{leaderboardStats && leaderboardStats.totalGames > 0 ? `Récord: ${leaderboardStats.highestScore}` : 'No hay registros aún'}</div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {leaderboardRankings.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                    <p className="text-neutral-500">No hay registros aún</p>
                  </div>
                ) : (
                  leaderboardRankings.map((entry, index) => (
                    <div key={entry.id || index} className={`flex items-center gap-4 p-4 rounded-xl border bg-neutral-900/50`}>
                      <div className="w-10 flex justify-center text-[#d99133] font-mono font-bold">#{index+1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">{entry.playerName || 'Jugador Anónimo'}</div>
                        <div className="text-xs text-neutral-500">Oleada {entry.wave || 1} • {entry.kills || 0} kills</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#d99133]">{entry.score?.toLocaleString() || 0}</div>
                        <div className="text-xs text-neutral-500">{entry.date}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
