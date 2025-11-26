"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedHeroCardsProps {
  products: any[];
}

export const AnimatedHeroCards = ({ products }: AnimatedHeroCardsProps) => {
  const cards = products.slice(0, 4);
  const [shuffledCards, setShuffledCards] = useState(cards);

  const positions = [
    { x: 12, y: 8, rotate: 3, zIndex: 10 }, // bottom
    { x: 8, y: 4, rotate: 2, zIndex: 20 },
    { x: 4, y: 2, rotate: 1, zIndex: 30 },
    { x: 0, y: 0, rotate: 0, zIndex: 40 }  // top
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setShuffledCards(prev => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[450px] aspect-square">
      {shuffledCards.map((product, index) => (
        <motion.div
          key={product.id}
          className="absolute inset-0 drop-shadow-lg"
          initial={positions[index]}
          animate={positions[index]}
          transition={{ duration: 0.5 }}
          style={{ zIndex: positions[index].zIndex }}
        >
          {product.images && product.images.length > 0 && (
            <Image
              alt={product.name || "Product"}
              src={product.images[0]}
              fill
              className="rounded object-cover"
              sizes="(max-width: 768px) 100vw, 450px"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};