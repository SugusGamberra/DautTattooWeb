document.addEventListener("DOMContentLoaded", () => {
    // estilo hamburguesa pal movil
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
    }

    // navegador pc
    if (document.body.classList.contains("page-home")) {
        initHomeSlideshow(); 
    } else if (document.body.classList.contains("page-gallery")) {
        initAutoScrollGallery(); 
    } else {
        initOriginalScript();
    }

    //fancybox con innertial y draggable
    if (typeof Fancybox !== "undefined") {
        Fancybox.bind("[data-fancybox]", {
            caption: (fancybox, slide) => {
                if (!slide) return ''; 

                const $trigger = slide.triggerEl;
                if (!$trigger) return '';

                const titleEl = $trigger.querySelector('.gallery-card__title');
                const title = titleEl ? titleEl.innerHTML : ''; 
                
                const desc = $trigger.dataset.caption || ""; 

                let html = '';
                if (title) html += `<div class="fancy-title">${title}</div>`;
                if (desc) html += `<div class="fancy-desc">${desc}</div>`;

                if (html) {
                    return `<div class="fancybox-custom-caption">${html}</div>`;
                }
                
                return null;
            }
        });
    }
});

// resto d paginas
function initOriginalScript() {
    const idText = document.getElementById("id-text");
    if (idText) {
        idText.addEventListener("click", () =>
        alert("Has hecho clic en el subtítulo!")
        );
    }
}

// carrusel en loop infinito
function initAutoScrollGallery() {
    if (typeof gsap === "undefined") {
        console.error("GSAP no se ha cargado correctamente.");
        return;
    }
    
    const gallery = document.querySelector(".draggable-gallery");
    const inner = document.querySelector(".gallery-inner");
    const cards = gsap.utils.toArray(".gallery-card");
    
    if (!gallery || !inner || cards.length === 0) {
        console.error("Elementos de la galería no encontrados.");
        return;
    }

    // clones de tarjetas
    cards.forEach(card => {
        inner.appendChild(card.cloneNode(true));
    });
    
    const cardWidth = cards[0].offsetWidth; 
    const gap = 30;
    const cardWidthWithGap = cardWidth + gap;
    
    const setWidth = cards.length * cardWidthWithGap;
    gsap.set(inner, { width: setWidth * 2, x: 0 }); 

    const autoScroll = gsap.to(inner, {
        x: -setWidth,
        duration: 30,
        ease: "none",
        repeat: -1, 
        
        onRepeat: function() {
            gsap.set(this.targets()[0], { x: 0 });
            this.vars.x = -setWidth;
        }
    });

    // pausa/reanudacion
    gallery.addEventListener('mouseenter', () => autoScroll.pause());
    gallery.addEventListener('mouseleave', () => autoScroll.resume());
    
    // moviles
    gallery.addEventListener('touchstart', () => autoScroll.pause());
    gallery.addEventListener('touchend', () => autoScroll.resume());
    
    cards.forEach((card, index) => {
        card.setAttribute('data-index', index);
    });

    const allClonedCards = gsap.utils.toArray(".gallery-inner .gallery-card");
    allClonedCards.forEach((card, index) => {
        card.setAttribute('data-index', index % cards.length);
    });
}

// slideshow index
function initHomeSlideshow() {
    const slideshow = document.querySelector(".slideshow");
    if (!slideshow) return; 
    
    const slides = document.querySelectorAll(".slide");
    const slideImages = document.querySelectorAll(".slide__img");
    const counterStrip = document.querySelector(".counter-strip");
    const counterTotal = document.querySelector(".counter-total");
    
    if (typeof gsap === "undefined" || typeof CustomEase === "undefined") {
        console.error("GSAP o CustomEase no se han cargado.");
        return;
    }

    let currentIndex = 0;
    let isAnimating = false;
    const slideCount = slides.length; 
    const NEXT = 1;
    const PREV = -1;
    const SLIDE_DURATION = 1.5; 

    CustomEase.create("textReveal", "0.77, 0, 0.175, 1");
    CustomEase.create("counterSlide", "0.25, 1, 0.5, 1");
    CustomEase.create("zoomIn", "0.16, 1, 0.3, 1");
    CustomEase.create("zoomOut", "0.7, 0, 0.3, 1");
    CustomEase.create("bounceOut", "0.22, 1.2, 0.36, 1");

    function formatNumber(num) {
        return num < 10 ? `0${num}` : `${num}`;
    }

    function initCounterStrip() {
        if (!counterStrip || !counterTotal) return;
        counterStrip.innerHTML = ""; 
        for (let i = 0; i < slideCount; i++) {
            const numberDiv = document.createElement("div");
            numberDiv.className = "counter-number";
            numberDiv.textContent = formatNumber(i + 1);
            counterStrip.appendChild(numberDiv);
        }
        counterTotal.textContent = formatNumber(slideCount);
        gsap.set(counterStrip, { y: 0 });
    }

    function animateCounter(targetIndex) {
        if (!counterStrip) return;
        const numberEl = counterStrip.querySelector(".counter-number");
        if (!numberEl) return; 
        const numberHeight = numberEl.clientHeight;
        const targetY = -targetIndex * numberHeight; 
        gsap.to(counterStrip, {
            y: targetY,
            duration: SLIDE_DURATION,
            ease: "counterSlide",
            delay: 0.2
        });
    }

    function navigate(direction) {
        if (isAnimating) return;
        const prevIndex = currentIndex;
        if (direction === NEXT) {
            currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
        } else {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
        }
        performNavigation(prevIndex, currentIndex, direction);
    }

    function performNavigation(prevIndex, nextIndex, direction) {
        isAnimating = true;
        const currentSlide = slides[prevIndex];
        const currentImage = slideImages[prevIndex];
        const currentTextLines = currentSlide.querySelectorAll(".slide__text-line");
        const nextSlide = slides[nextIndex];
        const nextImage = slideImages[nextIndex];
        const nextTextLines = nextSlide.querySelectorAll(".slide__text-line");

        const tl = gsap.timeline({
            defaults: { duration: SLIDE_DURATION, ease: "power2.inOut" },
            onComplete: () => {
                gsap.set(currentSlide, { visibility: "hidden" });
                currentSlide.classList.remove("active");
                nextSlide.classList.add("active");
                isAnimating = false;
            }
        });

        animateCounter(nextIndex);
        tl.to(currentTextLines, { y: "-100%", opacity: 0, duration: 0.7, stagger: 0.05, ease: "power2.in" }, 0);

        const zoomDirection = direction === NEXT ? 1 : -1;
        gsap.set(nextSlide, { visibility: "visible", scale: zoomDirection === 1 ? 0.7 : 1.3, opacity: 0, transformOrigin: "center center" });
        gsap.set(nextImage, { scale: zoomDirection === 1 ? 1.3 : 0.8, opacity: 0.5, transformOrigin: "center center" });

        tl.to(currentSlide, { scale: zoomDirection === 1 ? 1.3 : 0.7, opacity: 0, ease: "zoomOut" }, 0.2);
        tl.to(currentImage, { scale: zoomDirection === 1 ? 0.8 : 1.3, ease: "zoomOut" }, 0.2);
        tl.to(nextSlide, { scale: 1, opacity: 1, ease: "bounceOut" }, 0.4);
        tl.to(nextImage, { scale: 1, opacity: 1, ease: "zoomIn" }, 0.4);

        gsap.set(nextTextLines, { y: "100%", opacity: 0 });
        tl.to(nextTextLines, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "textReveal" }, 0.7);
    }

    initCounterStrip();
    const firstSlideTextLines = slides[0].querySelectorAll(".slide__text-line");
    gsap.to(firstSlideTextLines, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, delay: 0.5, ease: "textReveal" });

    let lastTime = 0;
    const throttleDelay = 1000; 
    slideshow.addEventListener("wheel", (e) => {
        e.preventDefault(); 
        const currentTime = new Date().getTime();
        if (currentTime - lastTime < throttleDelay) return;
        lastTime = currentTime;
        if (e.deltaY > 0) {
            navigate(NEXT);
        } else {
            navigate(PREV);
        }
    });

    let touchStartY = 0;
    slideshow.addEventListener("touchstart", (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    slideshow.addEventListener("touchend", (e) => {
        const touchEndY = e.changedTouches[0].screenY;
        if (isAnimating) return;
        if (touchStartY > touchEndY + 50) {
            navigate(NEXT);
        } else if (touchStartY < touchEndY - 50) {
            navigate(PREV);
        }
    });
}