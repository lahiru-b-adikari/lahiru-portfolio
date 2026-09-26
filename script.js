const navLinks = document.querySelectorAll('.nav-link');
const sideItems = document.querySelectorAll('.side-item[data-section]');
const sections = document.querySelectorAll('main section[id]');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

function setActive(id) {
  // Update left-side section navigation
  sideItems.forEach(item => {
    item.classList.toggle('active', item.dataset.section === id);
  });

  // Update top navigation only for homepage sections
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';

    link.classList.toggle(
      'active',
      href === `index.html#${id}` || href === `#${id}`
    );
  });
}

// Update the fixed left rail from the section closest to the viewport center.
function updateSectionRail() {
  if (!sections.length) return;
  if (window.scrollY < 120) { setActive('home'); return; }
  const center = window.innerHeight * 0.5;
  let current = sections[0];
  let best = Infinity;
  sections.forEach(section => {
    const r = section.getBoundingClientRect();
    const sectionCenter = r.top + Math.min(r.height, window.innerHeight) / 2;
    const distance = Math.abs(sectionCenter - center);
    if (distance < best) { best = distance; current = section; }
  });
  setActive(current.id);
}
window.addEventListener('scroll', updateSectionRail, {passive:true});
window.addEventListener('resize', updateSectionRail);
window.addEventListener('load', updateSectionRail);

document.querySelectorAll('a[href*="#"]').forEach(link => {
  link.addEventListener('click', () => {
    if (mainNav && menuToggle) {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

const projectData = {
  brain: {
    label: 'FEATURED PROJECT / AI',
    title: 'Brain Tumor Detection System',
    description: 'A multimodal deep-learning concept for axial-view validation, tumor detection, tumor-type classification and segmentation using CT and MRI scans. The interface is designed around radiologist review and AI-assisted reporting.',
    tags: ['Python', 'Machine Learning', 'Computer Vision', 'CT + MRI']
  },
  movie: {
    label: 'WEB DEVELOPMENT',
    title: 'Movie Bloom',
    description: 'A cinema booking website concept with movie browsing, trailers, accessible captions and client-side booking validation.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Responsive UI']
  },
  teammate: {
    label: 'JAVA / OOP',
    title: 'TeamMate',
    description: 'An intelligent university gaming-club team formation system using survey-based player roles, team-size constraints and balancing rules.',
    tags: ['Java', 'OOP', 'Algorithms', 'CSV']
  }
};

const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalLabel = document.getElementById('modalLabel');
const modalTags = document.getElementById('modalTags');

document.querySelectorAll('.project-open').forEach(button => {
  button.addEventListener('click', () => {
    const project = projectData[button.dataset.project];
    modalLabel.textContent = project.label;
    modalTitle.textContent = project.title;
    modalDescription.textContent = project.description;
    modalTags.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please complete all fields.';
      return;
    }

    formStatus.textContent = 'Sending message...';

    try {
      const response = await fetch('http://127.0.0.1:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      });

      const data = await response.json();

      if (data.success) {
        formStatus.textContent = 'Message sent successfully. Thank you for reaching out!';
        contactForm.reset();
      } else {
        formStatus.textContent = data.message;
      }

    } catch (error) {
      console.error('Contact form error:', error);
      formStatus.textContent = 'Unable to send the message. Please try again.';
    }
  });
}

document.querySelectorAll('.socials a[href="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    alert('Add your real social-media URL in index.html.');
  });
});


// CV download button
const downloadResume = document.getElementById('downloadResume');

if (downloadResume) {
  downloadResume.addEventListener('click', async function (event) {
    event.preventDefault();

    const pdfUrl = new URL(
      'assets/cv/Lahiru_Adikari_CV.pdf',
      window.location.href
    ).href;

    try {
      const response = await fetch(pdfUrl, {
        method: 'GET',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'Lahiru_Adikari_CV.pdf';
      downloadLink.style.display = 'none';

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);

    } catch (error) {
      console.error('CV download error:', error);

      alert('The CV could not be downloaded. Please try again.');
    }
  });
}