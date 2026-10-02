// gallery.js - Charm Gallery Window Interactivity

(function () {
  const gridEl = document.getElementById("charms-grid");
  const emojiInput = document.getElementById("emoji-input");
  const btnApplyEmoji = document.getElementById("btn-apply-emoji");
  const emojiPreview = document.getElementById("current-emoji-preview");
  const btnToggleDangle = document.getElementById("btn-toggle-dangle");
  const toggleLabel = document.getElementById("toggle-label");
  const btnRitualQuick = document.getElementById("btn-ritual-quick");
  const fileInput = document.getElementById("image-file-input");
  const btnBrowseImage = document.getElementById("btn-browse-image");
  const btnHangImage = document.getElementById("btn-hang-image");
  const customImgThumb = document.getElementById("custom-img-thumb");
  const customImgIcon = document.getElementById("custom-img-icon");

  let activeSlug = "diya";
  let hangingCounts = {}; // slug -> how many of that charm are on screen
  let hangingTotal = 1;
  let activeEmoji = "🍀";
  let activeCustomImage = "";
  let activeCustomImageAspect = 1.0;
  let isDangled = true;

  function renderGrid() {
    gridEl.innerHTML = CHARMS.map((c) => {
      const count = hangingCounts[c.slug] || 0;
      const isActive = count > 0;
      const isCurrent = c.slug === activeSlug;
      let artContent = "";

      if (c.art.type === "svg") {
        artContent = `<svg class="card-svg" viewBox="${c.art.viewBox}" aria-label="${c.name}">${c.art.markup}</svg>`;
      } else if (c.slug === "custom") {
        artContent = `<div class="card-emoji-art">${activeEmoji}</div>`;
      } else if (c.slug === "custom-image") {
        artContent = activeCustomImage
          ? `<img class="card-img" src="${activeCustomImage}" alt="${c.name}"/>`
          : `<div class="card-emoji-art">🖼️</div>`;
      } else if (c.art.type === "garland") {
        artContent = `<img class="card-img" src="../assets/charms/nimbu-lemon.png" alt="${c.name}"/>`;
      } else if (c.art.type === "compound") {
        artContent = `<img class="card-img" src="${c.art.body || c.art.fallback}" alt="${c.name}"/>`;
      } else {
        artContent = `<img class="card-img" src="${c.art.src}" alt="${c.name}"/>`;
      }

      return `
        <article class="charm-card ${isActive ? "active" : ""}" data-slug="${c.slug}">
          ${isActive ? `<span class="active-badge">Hanging${count > 1 ? ` ×${count}` : ""}</span>` : ""}
          <div class="card-art">
            ${artContent}
          </div>
          <h3 class="card-title">${c.name}</h3>
          <span class="card-origin">${c.origin}</span>
          <p class="card-desc">${c.description}</p>
          <div class="card-actions">
            ${c.slug === "custom-image" ? `
              <button class="card-btn upload-image" data-slug="${c.slug}" title="Choose image from your computer">
                📁 ${activeCustomImage ? "Change Image" : "Upload Image"}
              </button>
              <button class="card-btn hang" data-slug="${c.slug}" title="Replace the current charm with this one">
                ${isCurrent ? "✓ Current" : "Hang charm"}
              </button>
              <button class="card-btn add" data-slug="${c.slug}" title="Hang this as an extra charm" ${hangingTotal >= 8 ? "disabled" : ""}>＋ Add</button>
            ` : `
              <button class="card-btn hang" data-slug="${c.slug}" title="Replace the current charm with this one">
                ${isCurrent ? "✓ Current" : "Hang charm"}
              </button>
              <button class="card-btn add" data-slug="${c.slug}" title="Hang this as an extra charm" ${hangingTotal >= 8 ? "disabled" : ""}>＋ Add</button>
              <button class="card-btn ritual" data-slug="${c.slug}">
                ${c.ritual.label}
              </button>
            `}
          </div>
        </article>
      `;
    }).join("");

    // Attach card event listeners
    gridEl.querySelectorAll(".card-btn.upload-image").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (fileInput) fileInput.click();
      });
    });

    const customImgArt = gridEl.querySelector('.charm-card[data-slug="custom-image"] .card-art');
    if (customImgArt) {
      customImgArt.style.cursor = "pointer";
      customImgArt.title = "Click to upload an image";
      customImgArt.addEventListener("click", () => {
        if (fileInput) fileInput.click();
      });
    }

    gridEl.querySelectorAll(".card-btn.hang").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.slug;
        if (slug === "custom-image" && !activeCustomImage) {
          if (fileInput) fileInput.click();
          return;
        }
        selectCharm(slug);
      });
    });

    gridEl.querySelectorAll(".card-btn.add").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.slug;
        if (slug === "custom-image" && !activeCustomImage) {
          if (fileInput) fileInput.click();
          return;
        }
        if (window.electronAPI) {
          window.electronAPI.addCharm(slug, activeEmoji, activeCustomImage, activeCustomImageAspect);
        }
      });
    });

    gridEl.querySelectorAll(".card-btn.ritual").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.slug;
        if (slug !== activeSlug) {
          selectCharm(slug);
          setTimeout(() => {
            if (window.electronAPI) window.electronAPI.triggerRitual();
          }, 300);
        } else {
          if (window.electronAPI) window.electronAPI.triggerRitual();
        }
      });
    });
  }

  function selectCharm(slug, emoji = activeEmoji, customImg = activeCustomImage, aspect = activeCustomImageAspect) {
    activeSlug = slug;
    if (emoji) activeEmoji = emoji;
    if (customImg) activeCustomImage = customImg;
    if (aspect) activeCustomImageAspect = aspect;
    if (window.electronAPI) {
      window.electronAPI.selectCharm(slug, activeEmoji, activeCustomImage, activeCustomImageAspect);
    }
    renderGrid();
  }

  // Custom Image File Picker
  if (btnBrowseImage && fileInput) {
    btnBrowseImage.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const img = new Image();
        img.onload = () => {
          activeCustomImage = dataUrl;
          activeCustomImageAspect = img.naturalWidth / img.naturalHeight;
          customImgThumb.src = dataUrl;
          customImgThumb.style.display = "block";
          customImgIcon.style.display = "none";
          btnHangImage.style.display = "inline-flex";
          selectCharm("custom-image", null, activeCustomImage, activeCustomImageAspect);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });

    if (btnHangImage) {
      btnHangImage.addEventListener("click", () => {
        if (activeCustomImage) {
          selectCharm("custom-image", null, activeCustomImage, activeCustomImageAspect);
        }
      });
    }
  }

  // Quick Emoji Pickers
  document.querySelectorAll(".emoji-quick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const emoji = btn.dataset.emoji;
      emojiInput.value = emoji;
      emojiPreview.textContent = emoji;
      selectCharm("custom", emoji);
    });
  });

  // Apply typed emoji
  btnApplyEmoji.addEventListener("click", () => {
    const emoji = emojiInput.value.trim();
    if (emoji) {
      emojiPreview.textContent = emoji;
      selectCharm("custom", emoji);
    }
  });

  emojiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnApplyEmoji.click();
    }
  });

  // Top header actions
  btnToggleDangle.addEventListener("click", () => {
    isDangled = !isDangled;
    toggleLabel.textContent = isDangled ? "Hide Charms" : "Dangle Charms";
    if (window.electronAPI) {
      window.electronAPI.toggleDangle();
    }
  });

  btnRitualQuick.addEventListener("click", () => {
    if (window.electronAPI) {
      window.electronAPI.triggerRitual();
    }
  });

  const btnQuitApp = document.getElementById("btn-quit-app");
  if (btnQuitApp) {
    btnQuitApp.addEventListener("click", () => {
      if (window.electronAPI && window.electronAPI.quitApp) {
        window.electronAPI.quitApp();
      } else {
        window.close();
      }
    });
  }

  function applyHanging(settings) {
    hangingCounts = {};
    const list = Array.isArray(settings && settings.dangles) && settings.dangles.length
      ? settings.dangles
      : [{ slug: (settings && settings.slug) || activeSlug }];
    list.forEach((d) => { hangingCounts[d.slug] = (hangingCounts[d.slug] || 0) + 1; });
    hangingTotal = list.length;
  }

  // Sync settings on load
  if (window.electronAPI) {
    window.electronAPI.onSettingsUpdated((settings) => {
      if (settings.slug) activeSlug = settings.slug;
      applyHanging(settings);
      renderGrid();
    });

    window.electronAPI.getSettings().then((settings) => {
      applyHanging(settings);
      if (settings) {
        if (settings.slug) activeSlug = settings.slug;
        if (settings.emoji) {
          activeEmoji = settings.emoji;
          emojiInput.value = activeEmoji;
          emojiPreview.textContent = activeEmoji;
        }
        if (settings.customImage) {
          activeCustomImage = settings.customImage;
          customImgThumb.src = activeCustomImage;
          customImgThumb.style.display = "block";
          customImgIcon.style.display = "none";
          btnHangImage.style.display = "inline-flex";
        }
        if (typeof settings.customImageAspect === "number") {
          activeCustomImageAspect = settings.customImageAspect;
        }
      }
      renderGrid();
    });

    window.electronAPI.onCharmChanged((data) => {
      activeSlug = data.slug;
      if (data.emoji) {
        activeEmoji = data.emoji;
        emojiInput.value = activeEmoji;
        emojiPreview.textContent = activeEmoji;
      }
      if (data.customImage) {
        activeCustomImage = data.customImage;
        customImgThumb.src = activeCustomImage;
        customImgThumb.style.display = "block";
        customImgIcon.style.display = "none";
        btnHangImage.style.display = "inline-flex";
      }
      if (typeof data.customImageAspect === "number") {
        activeCustomImageAspect = data.customImageAspect;
      }
      renderGrid();
    });
  } else {
    renderGrid();
  }
})();
