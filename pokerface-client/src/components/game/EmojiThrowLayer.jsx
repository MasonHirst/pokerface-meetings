import React, { useEffect, useRef, useState } from 'react';
import { eventBus } from '../../utils/eventBus';

const GRAVITY = 2200; // px/s^2
const MAX_DT = 0.034; // clamp dt to avoid large jumps

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
    const handleThrow = ({ emoji, cardRect }) => {
      if (!emoji || !cardRect) {
        return;
      }
      const footerRect = document
        ?.querySelector('.game-footer')
        ?.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const targetX = cardRect.left + cardRect.width / 2;
      const probabilityFromLeft = clamp(targetX / viewportWidth, 0.08, 0.92);

      const size = 24;
      const fromLeft = Math.random() < probabilityFromLeft;
      const startX = fromLeft ? -size : viewportWidth + size;
      const startY = clamp(
        cardRect.top + cardRect.height * (0.2 + Math.random() * 0.4),
        40,
        viewportHeight * 0.65
      );
      const hitX = fromLeft
        ? cardRect.left - size * 0.35
        : cardRect.right + size * 0.35;
      const hitY = clamp(
        cardRect.top + cardRect.height * (0.35 + Math.random() * 0.3),
        20,
        viewportHeight - 80
      );

      const travelTime = 0.55 + Math.random() * 0.25;
      const vx = (hitX - startX) / travelTime;
      const vy = (hitY - startY - 0.5 * GRAVITY * travelTime * travelTime) /
        travelTime;
      const footerFloorY = footerRect ? footerRect.top - 10 : null;
      const floorY = footerFloorY ?? viewportHeight * 0.62;

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

  const radius = size / 2;
  if (y + radius >= floorY) {
    y = floorY - radius;
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
