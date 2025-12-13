"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

export default function RetoGamerPage() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [showBossBar, setShowBossBar] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar high score
  useEffect(() => {
    const saved = localStorage.getItem('bj_game_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Game Engine
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width, height;

    // Resize handler
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Game state
    const state = {
      frames: 0,
      wave: 1,
      score: 0,
      bossActive: false,
      bossPhase: 'none',
      nextBossScore: 1500,
      running: true
    };

    const input = {
      x: width / 2,
      y: height * 0.8,
      active: false,
      keys: {}
    };

    // Entities
    let player, bullets = [], enemies = [], particles = [], stars = [];
    let boss = null;

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

    // Player class
    class Player {
      constructor() {
        this.x = width / 2;
        this.y = height * 0.85;
        this.radius = isMobile ? 6 : 4;
        this.speed = isMobile ? 6 : 8;
        this.hp = 100;
        this.maxHp = 100;
        this.lastShot = 0;
        this.shootDelay = isMobile ? 8 : 6;
      }

      update() {
        let dx = 0, dy = 0;
        if (input.keys.w || input.keys.ArrowUp) dy -= 1;
        if (input.keys.s || input.keys.ArrowDown) dy += 1;
        if (input.keys.a || input.keys.ArrowLeft) dx -= 1;
        if (input.keys.d || input.keys.ArrowRight) dx += 1;

        if (dx !== 0 || dy !== 0) {
          const len = Math.sqrt(dx * dx + dy * dy);
          this.x += (dx / len) * this.speed;
          this.y += (dy / len) * this.speed;
          input.active = false;
        } else if (input.active) {
          this.x += (input.x - this.x) * 0.15;
          this.y += (input.y - this.y) * 0.15;
        }

        this.x = Math.max(25, Math.min(width - 25, this.x));
        this.y = Math.max(25, Math.min(height - 25, this.y));

        // Auto-shoot
        if (state.frames - this.lastShot > this.shootDelay) {
          bullets.push(new Bullet(this.x - 8, this.y - 15, 0, -20, 'player'));
          bullets.push(new Bullet(this.x + 8, this.y - 15, 0, -20, 'player'));
          if (state.wave >= 2) {
            bullets.push(new Bullet(this.x, this.y - 10, -2, -18, 'player'));
            bullets.push(new Bullet(this.x, this.y - 10, 2, -18, 'player'));
          }
          this.lastShot = state.frames;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ffa500';

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
          ctx.lineTo(i, Math.sin(i * 0.5) * 2);
        }
        ctx.stroke();

        // Hitbox indicator
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Engine flames
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(-8, 10);
        ctx.lineTo(0, 10 + Math.random() * 10 + 5);
        ctx.lineTo(8, 10);
        ctx.fill();

        ctx.restore();
      }

      hit(dmg) {
        this.hp -= dmg;
        createParticles(this.x, this.y, 8, '#f00');
        setHealth(Math.max(0, this.hp));
        if (this.hp <= 0) {
          endGame();
        }
      }
    }

    // Boss class
    class Boss {
      constructor(difficulty) {
        this.x = width / 2;
        this.y = -150;
        this.targetY = height * 0.15;
        this.radius = isMobile ? 50 : 70;
        this.hp = 800 * difficulty;
        this.maxHp = this.hp;
        this.tick = 0;
        setBossMaxHealth(this.maxHp);
      }

      update() {
        this.tick++;
        
        if (state.bossPhase === 'entering') {
          this.y += (this.targetY - this.y) * 0.03;
          if (Math.abs(this.y - this.targetY) < 5) {
            state.bossPhase = 'fighting';
            setShowBossBar(true);
          }
          return;
        }

        // Movement pattern
        this.x = (width / 2) + Math.sin(this.tick * 0.015) * (width * 0.35);

        // Attack patterns
        if (this.tick % 80 === 0) this.shootBurgerWave();
        if (this.tick % 20 === 0) this.shootFries();
        if (this.tick % 50 === 0) this.shootPickleSpiral();
      }

      shootFries() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        for (let i = -1; i <= 1; i++) {
          bullets.push(new Bullet(
            this.x, this.y,
            Math.cos(angle + i * 0.15) * 7,
            Math.sin(angle + i * 0.15) * 7,
            'enemy_fries'
          ));
        }
      }

      shootPickleSpiral() {
        const count = 6;
        for (let i = 0; i < count; i++) {
          const angle = (this.tick * 0.08) + (Math.PI * 2 / count) * i;
          bullets.push(new Bullet(
            this.x, this.y,
            Math.cos(angle) * 4,
            Math.sin(angle) * 4,
            'enemy_pickle'
          ));
        }
      }

      shootBurgerWave() {
        const count = 12;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 / count) * i;
          bullets.push(new Bullet(
            this.x, this.y,
            Math.cos(angle) * 3.5,
            Math.sin(angle) * 3.5,
            'enemy_burger'
          ));
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        const bob = Math.sin(this.tick * 0.08) * 8;
        ctx.translate(0, bob);

        ctx.shadowBlur = 40;
        ctx.shadowColor = '#f00';

        // Giant burger boss
        const scale = isMobile ? 0.8 : 1;
        
        // Top bun
        ctx.fillStyle = '#fa0';
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
        ctx.fillStyle = '#800';
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
        ctx.fillStyle = '#fa0';
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

        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(-20 * scale, -35 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.arc(20 * scale, -35 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Evil smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -15 * scale, 30 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
      }

      takeDamage(amt) {
        if (state.bossPhase !== 'fighting') return;
        this.hp -= amt;
        setBossHealth(Math.max(0, this.hp));

        if (this.hp <= 0) {
          createParticles(this.x, this.y, 60, '#fa0');
          createParticles(this.x, this.y, 60, '#f00');
          state.score += 3000;
          setScore(state.score);
          setShowBossBar(false);
          state.bossActive = false;
          boss = null;
          state.bossPhase = 'none';
          state.nextBossScore = state.score + 3000;
          state.wave++;
        }
      }
    }

    // Bullet class
    class Bullet {
      constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.active = true;

        switch (type) {
          case 'player':
            this.radius = 4;
            this.color = '#fa0';
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
          default:
            this.radius = 5;
            this.color = '#f0f';
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
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
        ctx.restore();
      }
    }

    // Particle class
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 4 + 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= 0.025;
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

    function checkCollisions() {
      // Player bullets vs boss/enemies
      bullets.filter(b => b.type === 'player').forEach(b => {
        if (boss && state.bossPhase === 'fighting') {
          const dist = Math.hypot(b.x - boss.x, b.y - boss.y);
          if (dist < boss.radius + 10) {
            boss.takeDamage(15);
            b.active = false;
            createParticles(b.x, b.y, 3, '#fa0');
          }
        }
        enemies.forEach(e => {
          const dist = Math.hypot(b.x - e.x, b.y - e.y);
          if (dist < e.radius + 8) {
            e.hp -= 15;
            b.active = false;
            if (e.hp <= 0) {
              e.active = false;
              state.score += 100;
              setScore(state.score);
              createParticles(e.x, e.y, 12, e.color);
            }
          }
        });
      });

      // Enemy bullets vs player
      bullets.filter(b => b.type !== 'player').forEach(b => {
        const dist = Math.hypot(b.x - player.x, b.y - player.y);
        if (dist < player.radius + b.radius) {
          player.hit(12);
          b.active = false;
        } else if (dist < player.radius + b.radius + 25) {
          // Graze bonus
          state.score += 2;
          setScore(state.score);
        }
      });
    }

    function spawnEnemies() {
      if (state.bossPhase !== 'none') return;

      if (state.score >= state.nextBossScore && !state.bossActive) {
        startBossSequence();
        return;
      }

      if (state.frames % 50 === 0) {
        const type = Math.random() > 0.5 ? 'drone' : 'spinner';
        enemies.push({
          x: Math.random() * (width - 100) + 50,
          y: -40,
          active: true,
          type,
          hp: 25,
          radius: 22,
          color: type === 'drone' ? '#f0f' : '#0ff',
          tick: 0,
          update() {
            this.y += 2.5;
            this.tick++;
            if (this.type === 'drone' && this.tick % 70 === 0) {
              const angle = Math.atan2(player.y - this.y, player.x - this.x);
              bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * 5, Math.sin(angle) * 5, 'enemy'));
            }
            if (this.y > height + 50) this.active = false;
          }
        });
      }
    }

    function startBossSequence() {
      state.bossActive = true;
      state.bossPhase = 'warning';
      setShowWarning(true);

      enemies.forEach(e => {
        createParticles(e.x, e.y, 5, '#fff');
        e.active = false;
      });

      setTimeout(() => {
        setShowWarning(false);
        state.bossPhase = 'entering';
        boss = new Boss(state.wave);
      }, 2500);
    }

    function endGame() {
      state.running = false;
      const finalScore = state.score;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('bj_game_highscore', finalScore.toString());
      }
      setGameState('gameover');
    }

    // Initialize
    function init() {
      player = new Player();
      bullets = [];
      enemies = [];
      particles = [];
      stars = [];
      boss = null;

      for (let i = 0; i < 80; i++) {
        stars.push(new Star());
      }

      state.score = 0;
      state.frames = 0;
      state.wave = 1;
      state.bossActive = false;
      state.bossPhase = 'none';
      state.nextBossScore = 1500;
      state.running = true;

      setScore(0);
      setHealth(100);
      setShowBossBar(false);
      setBossHealth(0);
    }

    // Game loop
    function loop() {
      if (!state.running) return;

      // Clear with fade
      ctx.fillStyle = 'rgba(5, 5, 15, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Stars
      stars.forEach(s => {
        s.update();
        s.draw();
      });

      // Player
      player.update();
      player.draw();

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
          
          // Inner detail
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.globalAlpha = 0.3;
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

  return (
    <div className="fixed inset-0 bg-[#050510] overflow-hidden">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${gameState !== 'playing' ? 'opacity-30' : ''}`}
      />

      {/* HUD - Solo visible durante el juego */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10">
          {/* Score */}
          <div className="text-white font-mono text-xl sm:text-2xl font-bold drop-shadow-[0_0_10px_rgba(255,170,0,0.8)]">
            PUNTOS: {score.toLocaleString()}
          </div>

          {/* Health bar */}
          <div className="w-48 sm:w-64 h-4 sm:h-5 mt-2 border-2 border-cyan-400 rounded-full overflow-hidden bg-black/50 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
              style={{ width: `${health}%` }}
            />
          </div>

          {/* Boss health bar */}
          {showBossBar && (
            <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[70%] max-w-md">
              <div className="text-center text-red-500 font-bold text-sm sm:text-base mb-1 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                🍔 JACK EL PARRILLERO 🍔
              </div>
              <div className="h-5 sm:h-6 border-2 border-red-500 rounded bg-red-900/50 overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.5)]">
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
            <span className="text-2xl sm:text-4xl">JACK TIENE HAMBRE</span>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/80 backdrop-blur-sm p-4">
          <Link
            href="/"
            className="absolute top-4 left-4 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-semibold">Volver al menú</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
              NEON BURGER
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(255,0,0,0.6)]">
              HELL 🔥
            </h2>

            {highScore > 0 && (
              <div className="text-yellow-500 font-mono text-lg sm:text-xl mb-6">
                🏆 RÉCORD: {highScore.toLocaleString()}
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl sm:text-2xl rounded-2xl shadow-[0_0_30px_rgba(255,170,0,0.5)] hover:shadow-[0_0_50px_rgba(255,170,0,0.7)] transition-all active:scale-95 uppercase tracking-wider"
            >
              🎮 INSERTAR MONEDA
            </button>

            <div className="mt-8 text-neutral-500 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
              <p className="mb-2">
                {isMobile ? '👆 TOCA para mover' : '🖱️ MOUSE / ⌨️ WASD para mover'}
              </p>
              <p>Esquiva las papas fritas 🍟</p>
              <p>Destruye a JACK 🍔</p>
            </div>
          </div>

          <div className="absolute bottom-4 text-neutral-600 text-xs">
            Un minijuego de Big Jack 🍔
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/85 backdrop-blur-sm p-4">
          <h1 className="text-4xl sm:text-6xl font-black text-red-500 mb-4 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
            GAME OVER
          </h1>

          <div className="text-2xl sm:text-4xl font-bold text-white mb-2">
            PUNTUACIÓN: <span className="text-yellow-500">{score.toLocaleString()}</span>
          </div>

          {score >= highScore && score > 0 && (
            <div className="text-lg sm:text-xl text-green-400 font-bold mb-4 animate-pulse">
              🎉 ¡NUEVO RÉCORD! 🎉
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-lg sm:text-xl rounded-2xl shadow-lg hover:shadow-green-500/50 transition-all active:scale-95"
            >
              🔄 REINTENTAR
            </button>
            <button
              onClick={goToMenu}
              className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-lg sm:text-xl rounded-2xl border-2 border-neutral-600 transition-all active:scale-95"
            >
              📋 MENÚ
            </button>
          </div>

          <Link
            href="/"
            className="mt-8 text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
          >
            🍔 Volver al menú de Big Jack
          </Link>
        </div>
      )}
    </div>
  );
}
