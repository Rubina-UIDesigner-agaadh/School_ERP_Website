(function(){
  "use strict";

  /**
   * Load reusable HTML partials.
   * Pages use:
   *   <div data-include="partials/header.inc"></div>
   *   <div data-include="partials/footer.inc"></div>
   */
  function loadIncludes(){
    const includeElements = Array.from(document.querySelectorAll('[data-include]'));

    if(includeElements.length === 0){
      return Promise.resolve();
    }

    return Promise.all(includeElements.map(element => {
      const filePath = element.getAttribute('data-include');

      return fetch(filePath, {cache: 'no-cache'})
        .then(response => {
          if(!response.ok){
            throw new Error(`Could not load ${filePath}`);
          }

          return response.text();
        })
        .then(html => {
          element.innerHTML = html;
          element.removeAttribute('data-include');
        })
        .catch(error => {
          console.error(error);
          element.innerHTML = `<!-- Failed to load ${filePath}. Use a local server/live server instead of opening the file directly. -->`;
        });
    }));
  }

  function initSite(){
    const body = document.body;
    const header = document.querySelector('#header');

    function toggleScrolled(){
      if(!header) return;

      if(window.scrollY > 50){
        body.classList.add('scrolled');
      }else{
        body.classList.remove('scrolled');
      }
    }

    document.addEventListener('scroll', toggleScrolled);
    toggleScrolled();

    const navToggle = document.querySelector('.mobile-nav-toggle');

    function setMobileNavigation(open){
      if(!navToggle) return;

      body.classList.toggle('mobile-nav-active', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');

      const icon = navToggle.querySelector('i');

      if(icon){
        icon.classList.toggle('bi-list', !open);
        icon.classList.toggle('bi-x', open);
      }
    }

    if(navToggle){
      navToggle.addEventListener('click', function(){
        setMobileNavigation(!body.classList.contains('mobile-nav-active'));
      });
    }

    function closeMobileNavigation(){
      setMobileNavigation(false);
    }

    // Mark current page active after header partial is loaded.
    const current = window.location.pathname.split('/').pop() || 'index.html';

    const aboutPages = [
      'about.html',
      'about-ast.html',
      'why-ast.html',
      'about-company.html',
      'benefits-to-you.html',
      'our-approach.html'
    ];

    const productPages = [
      'product-services.html',
      'school-erp.html',
      'preschool-erp.html',
      'school-software.html',
      'modules.html'
    ];

    const featurePages = [
      'features-integration.html',
      'features.html',
      'admission-management.html',
      'student-management.html',
      'attendance-management.html',
      'fees-management.html',
      'timetable-management.html',
      'student-assessments.html',
      'certificate-management.html',
      'hr-management.html',
      'employee-leave-management.html',
      'payroll-management.html',
      'academic-management.html',
      'event-activity.html',
      'front-office.html',
      'health-management.html',
      'mis.html',
      'accounting-management.html',
      'transport-management.html',
      'inventory-management.html',
      'library-management.html',
      'hostel-management.html',
      'assets-management.html',
      'custom-module.html',
      'sms-integration.html',
      'email-integration.html',
      'whatsapp-integration.html',
      'online-payment.html',
      'tally-integration.html',
      'gps-integration.html',
      'barcode-integration.html',
      'biometric-integration.html',
      'google-apps.html',
      'microsoft-tools.html',
      'mobile-apps-integration.html',
    ];

    let activePage = current;

    if(aboutPages.includes(current)){
      activePage = 'about.html';
    }else if(productPages.includes(current)){
      activePage = 'product-services.html';
    }else if(featurePages.includes(current)){
      activePage = 'features-integration.html';
    }else if(['privacy-policy.html', 'terms-of-service.html', 'refund-policy.html'].includes(current)){
      activePage = 'contact.html';
    }

    document.querySelectorAll('#navmenu a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const cleanHref = href.split('?')[0].split('#')[0];

      if(cleanHref === activePage){
        link.classList.add('active');
      }
    });

    // Mega menu panels for About, Product & Services, and Features & Integration.
    const megaMenuItems = Array.from(document.querySelectorAll('.mega-menu-item'));
    const megaCloseTimers = new WeakMap();

    function cancelMegaClose(item){
      const timer = megaCloseTimers.get(item);

      if(timer){
        clearTimeout(timer);
        megaCloseTimers.delete(item);
      }
    }

    function closeMegaMenu(item){
      if(!item) return;

      cancelMegaClose(item);
      item.classList.remove('mega-open');

      const toggle = item.querySelector('.mega-menu-toggle');

      if(toggle){
        toggle.setAttribute('aria-expanded', 'false');
      }
    }

    function scheduleMegaClose(item){
      if(!item) return;

      cancelMegaClose(item);

      const timer = setTimeout(() => {
        closeMegaMenu(item);
      }, 350);

      megaCloseTimers.set(item, timer);
    }

    function closeAllMegaMenus(exceptItem){
      megaMenuItems.forEach(item => {
        if(exceptItem && item === exceptItem) return;
        closeMegaMenu(item);
      });
    }

    function openMegaMenu(item){
      if(!item) return;

      const toggle = item.querySelector('.mega-menu-toggle');

      cancelMegaClose(item);
      closeAllMegaMenus(item);
      item.classList.add('mega-open');

      if(toggle){
        toggle.setAttribute('aria-expanded', 'true');
      }
    }

    megaMenuItems.forEach(item => {
      const toggle = item.querySelector('.mega-menu-toggle');
      const panel = item.querySelector('.mega-menu-panel');

      if(!toggle || !panel) return;

      toggle.addEventListener('click', event => {
        const openPagePanel = toggle.getAttribute('data-open-page-panel');

        if(openPagePanel === 'features'){
          const targetUrl = new URL(toggle.getAttribute('href'), window.location.href);
          const currentPath = window.location.pathname.split('/').pop() || 'index.html';
          const targetPath = targetUrl.pathname.split('/').pop() || 'index.html';

          if(currentPath !== targetPath){
            // Let the browser open features-integration.html?open=features.
            // The panel will open automatically after that page loads.
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          openMegaMenu(item);
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const willOpen = !item.classList.contains('mega-open');

        if(willOpen){
          openMegaMenu(item);
        }else{
          item.classList.remove('mega-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });

      toggle.addEventListener('keydown', event => {
        if(event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          openMegaMenu(item);

          const firstLink = panel.querySelector('a');

          if(firstLink){
            firstLink.focus();
          }
        }
      });

      item.addEventListener('mouseenter', () => {
        if(window.matchMedia('(hover: hover) and (min-width: 1200px)').matches){
          cancelMegaClose(item);
          openMegaMenu(item);
        }
      });

      item.addEventListener('mouseleave', () => {
        if(window.matchMedia('(hover: hover) and (min-width: 1200px)').matches){
          scheduleMegaClose(item);
        }
      });

      panel.addEventListener('mouseenter', () => {
        if(window.matchMedia('(hover: hover) and (min-width: 1200px)').matches){
          cancelMegaClose(item);
          openMegaMenu(item);
        }
      });

      panel.addEventListener('mouseleave', () => {
        if(window.matchMedia('(hover: hover) and (min-width: 1200px)').matches){
          scheduleMegaClose(item);
        }
      });
    });

    document.querySelectorAll('#navmenu a').forEach(link => {
      link.addEventListener('click', () => {
        if(link.classList.contains('mega-menu-toggle')) return;

        closeAllMegaMenus();
        closeMobileNavigation();
      });
    });

    document.addEventListener('click', event => {
      if(!event.target.closest('.mega-menu-item')){
        closeAllMegaMenus();
      }
    });

    document.addEventListener('keydown', event => {
      if(event.key === 'Escape'){
        closeAllMegaMenus();
        closeMobileNavigation();
      }
    });

    // If Features & Integration was opened through the top text button,
    // automatically open the page and the panel.
    const params = new URLSearchParams(window.location.search);

    if(params.get('open') === 'features'){
      const featureToggle = document.querySelector('[aria-controls="mega-features-panel"]');
      const featureItem = featureToggle ? featureToggle.closest('.mega-menu-item') : null;

      if(featureItem){
        openMegaMenu(featureItem);

        if(window.matchMedia('(max-width: 1199px)').matches){
          setMobileNavigation(true);
        }
      }
    }

    // Floating right-side contact tabs.
    function initFloatingContactTabs(){
      if(document.querySelector('.floating-contact-tabs')) return;

      const contactTabs = document.createElement('div');
      contactTabs.className = 'floating-contact-tabs';
      contactTabs.setAttribute('aria-label', 'Quick contact options');

      const phoneDisplay = '+91 7567264049';
      const phoneHref = 'tel:+917567264049';
      const whatsappDisplay = '+91 7567264049';
      const whatsappHref = 'https://wa.me/917567264049?text=Hi%20AST%20Agaadh%20SoftTech%2C%20I%20want%20to%20know%20more%20about%20your%20school%20management%20software.';
      const demoHref = 'contact.html';

      contactTabs.innerHTML = `
        <a class="floating-contact-tab floating-call-tab" href="${phoneHref}" aria-label="Call AST at ${phoneDisplay}">
          <span class="floating-tab-icon"><i class="bi bi-telephone-fill"></i></span>
          <span class="floating-tab-content"><strong>Call Us</strong><small>${phoneDisplay}</small></span>
        </a>
        <a class="floating-contact-tab floating-whatsapp-tab" href="${whatsappHref}" target="_blank" rel="noopener" aria-label="Chat with AST on WhatsApp at ${whatsappDisplay}">
          <span class="floating-tab-icon"><i class="bi bi-whatsapp"></i></span>
          <span class="floating-tab-content"><strong>WhatsApp</strong><small>${whatsappDisplay}</small></span>
        </a>
        <a class="floating-contact-tab floating-demo-tab" href="${demoHref}" aria-label="Book a free AST School ERP demo">
          <span class="floating-tab-icon"><i class="bi bi-calendar2-check-fill"></i></span>
          <span class="floating-tab-content"><strong>Book Demo</strong><small>Free 30-minute demo</small></span>
        </a>
      `;

      document.body.appendChild(contactTabs);
    }

    initFloatingContactTabs();

    // Hero landing image slider with animation, arrows, dots, and autoplay.
    const hero = document.querySelector('.hero');
    const heroSlides = Array.from(document.querySelectorAll('.hero-bg'));
    const heroPrev = document.querySelector('.hero-slider-prev');
    const heroNext = document.querySelector('.hero-slider-next');
    const heroDots = document.querySelector('.hero-slider-dots');

    let heroIndex = heroSlides.findIndex(slide => slide.classList.contains('is-active'));
    let heroTimer = null;

    if(heroSlides.length > 0){
      if(heroIndex < 0){
        heroIndex = 0;
      }

      function buildHeroDots(){
        if(!heroDots) return;

        heroDots.innerHTML = '';

        heroSlides.forEach((_, index) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', `Show hero image ${index + 1}`);
          dot.addEventListener('click', () => {
            showHeroSlide(index);
            restartHeroAutoplay();
          });
          heroDots.appendChild(dot);
        });
      }

      function updateHeroDots(){
        if(!heroDots) return;

        Array.from(heroDots.children).forEach((dot, index) => {
          dot.classList.toggle('is-active', index === heroIndex);
          dot.setAttribute('aria-current', index === heroIndex ? 'true' : 'false');
        });
      }

      function showHeroSlide(nextIndex){
        heroSlides[heroIndex].classList.remove('is-active');
        heroIndex = (nextIndex + heroSlides.length) % heroSlides.length;
        heroSlides[heroIndex].classList.add('is-active');
        updateHeroDots();
      }

      function nextHeroSlide(){
        showHeroSlide(heroIndex + 1);
      }

      function prevHeroSlide(){
        showHeroSlide(heroIndex - 1);
      }

      function startHeroAutoplay(){
        if(heroSlides.length <= 1) return;
        heroTimer = setInterval(nextHeroSlide, 5000);
      }

      function stopHeroAutoplay(){
        if(heroTimer){
          clearInterval(heroTimer);
          heroTimer = null;
        }
      }

      function restartHeroAutoplay(){
        stopHeroAutoplay();
        startHeroAutoplay();
      }

      buildHeroDots();
      showHeroSlide(heroIndex);

      if(heroNext){
        heroNext.addEventListener('click', () => {
          nextHeroSlide();
          restartHeroAutoplay();
        });
      }

      if(heroPrev){
        heroPrev.addEventListener('click', () => {
          prevHeroSlide();
          restartHeroAutoplay();
        });
      }

      if(hero){
        hero.addEventListener('mouseenter', stopHeroAutoplay);
        hero.addEventListener('mouseleave', startHeroAutoplay);
      }

      startHeroAutoplay();
    }

    // FAQ accordion.
    document.querySelectorAll('.faq-item .faq-header').forEach(button => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const isOpen = item.classList.toggle('faq-active');
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });

    // Demo/newsletter/brochure placeholder handlers.
    document.querySelectorAll('form[data-form-type]').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const status = form.querySelector('.form-status');
        if(status){ status.classList.add('show'); }
        form.reset();
      });
    });

    const preloader = document.querySelector('#preloader');

    function removePreloader(){
      body.classList.add('loaded');
      if(preloader){ setTimeout(() => preloader.remove(), 450); }
    }

    if(document.readyState === 'complete'){
      removePreloader();
    }else{
      window.addEventListener('load', removePreloader);
    }

    const scrollTop = document.querySelector('#scroll-top');

    function toggleScrollTop(){
      if(scrollTop){
        if(window.scrollY > 100){ scrollTop.classList.add('active'); }
        else{ scrollTop.classList.remove('active'); }
      }
    }

    if(scrollTop){
      scrollTop.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({top: 0, behavior: 'smooth'});
      });
      document.addEventListener('scroll', toggleScrollTop);
      toggleScrollTop();
    }

    const year = document.querySelector('#year');
    if(year){ year.textContent = new Date().getFullYear(); }

    if(typeof AOS !== 'undefined'){
      AOS.init({duration: 600, easing: 'ease-in-out', once: true, mirror: false});
    }

    if(typeof PureCounter !== 'undefined'){
      new PureCounter();
    }

    // Ecosystem collage individual 3D tilt / parallax effect on mouse movement.
    const collageCards = document.querySelectorAll('.ecosystem-collage-card');
    collageCards.forEach(card => {
      let isHovered = false;

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        card.classList.add('is-hovered');
      });

      card.addEventListener('mousemove', event => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;

        const maxTilt = 10;
        const rotateX = (-mouseY / (rect.height / 2)) * maxTilt;
        const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.05, 1.05, 1.05)`;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.classList.remove('is-hovered');
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        setTimeout(() => {
          if (!isHovered) {
            card.style.transform = '';
          }
        }, 300);
      });
    });
  }

  function start(){
    loadIncludes().then(initSite);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  }else{
    start();
  }

})();
