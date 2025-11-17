// podria haber modularizado el script tambien pero como ya mas o menos me olia que no iba a quedar muy largo pues...
// pero si, hubiera sido una buena practica :P

// puerta de entrada: basicamente no ejecuta nada hasta que el html este cargado, para evitar errores o que se quede buscando un boton que no se ha pintado en pantalla
document.addEventListener("DOMContentLoaded", () => {
    // estilo hamburguesa pal movil (los ids que puse en layout se ven aqui jeje)
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // si el boton recibe un click se abre el menu en el movil
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
    }

    // navegador pc
    // si el cuerpo tiene la clase page-home llama a la funcion initHomeSlidewshow
    // si contiene page-gallery llama a initAutoScrollGallery
    // y si no se cumple ninguna de las aanteriores le mete el script origianl
    // con esto evitamos que desde cualquier lado se llamen los scripts que no tocan, ya que si llamo el autoscroll de la galeria en contacto x ejemplo daria error xk no existe ahi
    if (document.body.classList.contains("page-home")) {
        initHomeSlideshow(); 
    } else if (document.body.classList.contains("page-gallery")) {
        initAutoScrollGallery(); 
    } else {
        initOriginalScript();
    }

    //fancybox con innertial y draggable
    // si el user clica un enlace (a) que tenga el atributo data-fancybox emtra en accion
    // con caption personalizo el pie de foto, para que no se limite a usar el data-caption del enlace
    // asi cuando abres la foto el pie de foto es el titulo con la descripcion que puse en galeria
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

// carrusel en loop infinito
// uso GSAP aqui para crar este carrusel, para hacerlo bucle infinito coge todas las tarjetas de la galeria
// (las 8 que hay de momento), las clona y las pone justo despues
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

    // esta es la animacion: le digo que lo mueva el inner hacia la izquierda y lo que ocupa las tarjetas
    // a velocidad constante y que lo repita infinitamente
    // cuando la animacion termina transporta el inner a su posicion inicial al instante
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

    // pausa/reanudacion: cuando le pasas el raton x encima para la animacion y cuando lo quitas reanuda
    gallery.addEventListener('mouseenter', () => autoScroll.pause());
    gallery.addEventListener('mouseleave', () => autoScroll.resume());
    
    // moviles: igual que antes pero cuando tocas la pantalla
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
// esto es cuando en el index (inicio) le haces scroll, las animaciones
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

    // estas son las curvas de velocidad de la animacion para que se vean mas chulas y no tan estaticas
    CustomEase.create("textReveal", "0.77, 0, 0.175, 1");
    CustomEase.create("counterSlide", "0.25, 1, 0.5, 1");
    CustomEase.create("zoomIn", "0.16, 1, 0.3, 1");
    CustomEase.create("zoomOut", "0.7, 0, 0.3, 1");
    CustomEase.create("bounceOut", "0.22, 1.2, 0.36, 1");

    function formatNumber(num) {
        return num < 10 ? `0${num}` : `${num}`;
    }

    // este es el contador del index
    // rellena el contador de numeros uno encima de otro, y con animateCounter lo animo usando gsap, animacion vertical hasta que el numero correcto qeude visible
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

    // gestiona que slide toca, isAnimating es como un boolean (true cuando empieza una animacion y false cuando termina)
    // asi evitamos que el user pueda hacer scroll como un loco y romper o solapar las animaciones
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

    // con esto creamos la funcion que usamos arriba donde ocultamos el texto del slide actual haciendolo caer
    // prepara el slide siguiente 
    // anima el slide actual y el siguiente para que aparezca (bounceOut)
    // anima el texto del nuevo slide (textReveal)
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

    // escuchan la rueda del raton y el deslizamiento con el movil para llamar la funcion de perfomrNavigation y cambiar de slide
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