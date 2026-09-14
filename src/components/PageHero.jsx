import React from "react";

export default function PageHero({ title, accent, text, image, eyebrow }) {
  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title} <em>{accent}</em></h1>
        <p>{text}</p>
      </div>
      {image && <img src={image} alt="" />}
    </section>
  );
}