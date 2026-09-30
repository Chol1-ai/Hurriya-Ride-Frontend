<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="landing-page">
    <header class="landing-header">
      <RouterLink class="brand" to="/" aria-label="Hurriya Ride home">
        <span class="brand-mark">H</span>
        <span>Hurriya Ride</span>
      </RouterLink>
      <span class="city-label">Juba, South Sudan</span>
      <RouterLink class="login-link" to="/login">Log in <span aria-hidden="true">↗</span></RouterLink>
    </header>

    <main>
      <section class="landing-hero" aria-labelledby="landing-title">
        <img
          class="hero-image"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Juba_City.jpg/1920px-Juba_City.jpg"
          alt="Aerial panorama of Juba, South Sudan"
          fetchpriority="high"
        >
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="hero-copy">
          <p class="eyebrow">Your city, within reach</p>
          <h1 id="landing-title">Hurriya Ride</h1>
          <p class="hero-description">Get where you need to go across Juba, with a ride that fits your day.</p>
          <div class="hero-actions">
            <RouterLink class="primary-action" to="/login?mode=register">Get started <span aria-hidden="true">→</span></RouterLink>
            <RouterLink class="secondary-action" to="/login">I already have an account</RouterLink>
          </div>
        </div>
      </section>

      <section class="service-band" aria-labelledby="service-heading">
        <div class="service-intro">
          <p class="eyebrow">A ride for your day</p>
          <h2 id="service-heading">Choose your way around.</h2>
        </div>
        <div class="service-list">
          <div><span class="service-number">01</span><strong>Boda</strong><span class="service-note">Quick city trips</span></div>
          <div><span class="service-number">02</span><strong>Tuktuk</strong><span class="service-note">Room to ride together</span></div>
          <div><span class="service-number">03</span><strong>Car</strong><span class="service-note">Comfort for longer days</span></div>
        </div>
        <p class="photo-credit"><a href="https://commons.wikimedia.org/wiki/File:Juba_City.jpg" target="_blank" rel="noreferrer">Photo credit</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.landing-page { min-height: 100vh; background: var(--surface-lowest); color: var(--on-surface); font-family: var(--font-family); }
.landing-header { position: absolute; z-index: 3; top: 0; left: 0; display: grid; width: 100%; min-height: 76px; grid-template-columns: 1fr 1fr 1fr; align-items: center; padding: 0 5vw; color: #fff; }
.brand { display: inline-flex; align-items: center; gap: 10px; width: fit-content; color: #fff; font-size: 15px; font-weight: 800; text-decoration: none; }
.brand-mark { display: grid; width: 34px; aspect-ratio: 1; place-items: center; background: var(--primary); color: #261700; font-size: 19px; }
.city-label { justify-self: center; color: rgba(255,255,255,.78); font-size: 12px; }
.login-link { justify-self: end; padding: 10px 0 10px 14px; color: #fff; font-size: 13px; font-weight: 700; text-decoration: none; }
.login-link span { margin-left: 5px; color: var(--primary-soft); }
.landing-hero { position: relative; display: flex; height: min(710px, 72svh); min-height: 500px; align-items: flex-end; overflow: hidden; background: #0b1825; }
.hero-image, .hero-shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-image { object-fit: cover; object-position: center 55%; }
.hero-shade { background: rgba(1,15,31,.44); }
.hero-copy { position: relative; z-index: 1; width: min(680px, 88vw); padding: 0 0 64px 9vw; }
.eyebrow { margin: 0 0 12px; color: var(--primary-soft); font-size: 11px; font-weight: 700; text-transform: uppercase; }
h1 { margin: 0; color: #fff; font-size: 64px; line-height: 1.06; }
.hero-description { max-width: 440px; margin: 18px 0 26px; color: rgba(255,255,255,.88); font-size: 17px; line-height: 1.55; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; }
.primary-action { display: inline-flex; min-height: 50px; align-items: center; gap: 24px; padding: 0 18px; background: var(--primary); color: #261700; font-size: 13px; font-weight: 800; text-decoration: none; }
.primary-action span { font-size: 18px; }
.primary-action:hover { background: var(--primary-soft); }
.secondary-action { color: #fff; font-size: 13px; font-weight: 700; text-decoration-thickness: 1px; text-underline-offset: 4px; }
.service-band { display: grid; grid-template-columns: minmax(220px, .8fr) 1.8fr; gap: 36px; max-width: 1320px; margin: 0 auto; padding: 34px 5vw 42px; }
.service-intro .eyebrow { margin-bottom: 7px; }
.service-intro h2 { margin: 0; font-size: 20px; line-height: 1.35; }
.service-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.service-list > div { display: grid; grid-template-columns: auto 1fr; align-content: start; gap: 4px 10px; padding: 4px 16px; border-left: 1px solid var(--outline); }
.service-number { grid-row: span 2; color: var(--primary-soft); font-size: 11px; }
.service-list strong { font-size: 14px; }
.service-note { color: var(--muted); font-size: 11px; line-height: 1.4; }
.photo-credit { grid-column: 1 / -1; margin: -18px 0 0; color: var(--muted); font-size: 10px; line-height: 1.5; }
.photo-credit a { color: var(--muted); text-underline-offset: 2px; }
.photo-credit a:hover { color: var(--primary-soft); }
@media (max-width: 700px) {
  .landing-header { min-height: 66px; grid-template-columns: 1fr auto; padding: 0 20px; }
  .city-label { display: none; }
  .landing-hero { height: min(680px, 68svh); min-height: 500px; }
  .hero-image { object-position: 58% center; }
  .hero-shade { background: rgba(1,15,31,.5); }
  .hero-copy { width: 100%; padding: 0 22px 42px; }
  h1 { font-size: 44px; }
  .hero-description { max-width: 340px; font-size: 15px; }
  .service-band { grid-template-columns: 1fr; gap: 18px; padding: 25px 20px 32px; }
  .photo-credit { margin: 0; }
  .service-list > div { grid-template-columns: 1fr; gap: 4px; padding: 0 10px; }
  .service-list > div:first-child { padding-left: 0; border-left: 0; }
  .service-number { grid-row: auto; }
  .service-note { font-size: 10px; }
}
</style>