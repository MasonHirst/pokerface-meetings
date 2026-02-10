import React, { useEffect, useRef, useState } from 'react';
import { eventBus } from '../../utils/eventBus';
import { clamp } from '../../utils/helperFunctions';

const GRAVITY = 2200; // px/s^2
const MAX_DT = 0.034; // clamp dt to avoid large jumps
const WALL_BOUNCE = 0.62;
const FADE_DURATION = 0.9; // seconds

function getLastEmojiValue(value) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    return value.native || value.emoji || null;
  }
  return null;
}

const EmojiThrowLayer = () => {
  const [emojis, setEmojis] = useState([]);
  const emojisRef = useRef([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    emojisRef.current = emojis;
  }, [emojis]);

  useEffect(() => {
    const animate = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const dt = clamp((time - lastTimeRef.current) / 1000, 0, MAX_DT);
      lastTimeRef.current = time;

      if (emojisRef.current.length > 0) {
        setEmojis((prev) =>
          prev
            .map((emoji) => stepEmoji(emoji, dt))
            .filter((emoji) => emoji !== null)
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleThrow = ({ emoji, targetPlayerId, fromSide }) => {
      if (!emoji || !targetPlayerId) {
        return;
      }
      const cardElement = document.querySelector(
        `[data-player-id="${targetPlayerId}"]`
      );
      const cardRect = cardElement?.getBoundingClientRect();
      if (!cardRect) {
        return;
      }
      const footerRect = document
        ?.querySelector('.game-footer')
        ?.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const size = 26;
      const fromLeft = fromSide === 'left';
      const startX = fromLeft ? -size : viewportWidth + size;
      const startY = clamp(
        cardRect.top + cardRect.height * (0.2 + Math.random() * 0.4),
        40,
        viewportHeight * 0.65
      );
      const edgeBiasLeft = -size;
      const edgeBiasRight = size * 0.05;
      const hitX = fromLeft
        ? cardRect.left + edgeBiasLeft
        : cardRect.right - edgeBiasRight;
      const hitY = clamp(
        cardRect.top + cardRect.height * (0.24 + Math.random() * 0.12),
        20,
        viewportHeight - 80
      );

      const speed = 550;
      const dx = hitX - startX;
      const dy = hitY - startY;
      const distance = Math.hypot(dx, dy);
      const travelTime = clamp(distance / speed, 0.22, 0.6);
      const vx = (hitX - startX) / travelTime;
      const vy = (hitY - startY - 0.5 * GRAVITY * travelTime * travelTime) /
        travelTime;
      const footerFloorY = footerRect?.top;
      const floorY = clamp(
        footerFloorY ?? viewportHeight - 30,
        size + 8,
        viewportHeight - 8
      );
      const minX = 0;
      const maxX = Math.max(minX, viewportWidth - size);

      setEmojis((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          emoji: getLastEmojiValue(emoji) || emoji,
          x: startX,
          y: startY,
          vx,
          vy,
          rotation: Math.random() * 40,
          vRot: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 160),
          hasHit: false,
          hitX,
          fromLeft,
          size,
          floorY,
          minX,
          maxX,
          life: 4 + Math.random() * 2,
        },
      ]);
    };

    eventBus.on('funThrowEmoji', handleThrow);
    return () => {
      eventBus.off('funThrowEmoji', handleThrow);
    };
  }, []);

  return (
    <div className='emoji-throw-layer'>
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className='emoji-throw-item'
          style={{
            transform: `translate3d(${emoji.x}px, ${emoji.y}px, 0) rotate(${emoji.rotation}deg)`,
            fontSize: `${emoji.size}px`,
            opacity: emoji.life > FADE_DURATION
              ? 1
              : clamp(emoji.life / FADE_DURATION, 0, 1),
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};

const stepEmoji = (emoji, dt) => {
  let {
    x,
    y,
    vx,
    vy,
    rotation,
    vRot,
    hasHit,
    hitX,
    fromLeft,
    size,
    floorY,
    minX,
    maxX,
    life,
  } = emoji;

  life -= dt;
  if (life <= 0) {
    return null;
  }

  vy += GRAVITY * dt;
  x += vx * dt;
  y += vy * dt;
  rotation += vRot * dt;

  if (!hasHit) {
    const passedHit = fromLeft ? x >= hitX : x <= hitX;
    if (passedHit) {
      hasHit = true;
      x = hitX;
      vx = -vx * (0.28 + Math.random() * 0.15);
      vy = vy * 0.5 - (120 + Math.random() * 90);
      vRot = (Math.random() > 0.5 ? 1 : -1) * (260 + Math.random() * 220);
    }
  }

  if (x <= minX && vx < 0) {
    x = minX;
    vx = -vx * WALL_BOUNCE;
    vy *= 0.96;
    vRot = -vRot * 0.55;
  } else if (x >= maxX && vx > 0) {
    x = maxX;
    vx = -vx * WALL_BOUNCE;
    vy *= 0.96;
    vRot = -vRot * 0.55;
  }

  if (y + size >= floorY) {
    y = floorY - size;
    if (Math.abs(vy) > 180) {
      vy = -vy * 0.35;
      vx *= 0.85;
    } else {
      vy = 0;
      vx *= 0.95;
    }
    vRot = vx * 3;

    if (Math.abs(vx) < 10 && Math.abs(vy) < 30) {
      vx *= 0.9;
      vRot *= 0.9;
    }
  }

  return {
    ...emoji,
    x,
    y,
    vx,
    vy,
    rotation,
    vRot,
    hasHit,
    life,
  };
};

export default EmojiThrowLayer;
