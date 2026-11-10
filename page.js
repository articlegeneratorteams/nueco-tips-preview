(function () {
  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("nav-toggle");
  var active = null;

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".nav-parent").forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.parentElement;
      var open = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  if (nav) {
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a") && window.matchMedia("(max-width: 860px)").matches) closeNav();
    });
  }

  function buildPlayButton(id, title) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "video-play";
    button.setAttribute("data-video-id", id);
    button.setAttribute("data-title", title);
    button.setAttribute("aria-label", "Play " + title + " on this page");
    var img = document.createElement("img");
    img.alt = "";
    img.width = 480;
    img.height = 360;
    img.src = "https://i.ytimg.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg";
    img.addEventListener("error", function () { img.remove(); });
    var mark = document.createElement("span");
    mark.className = "play-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "Play";
    button.append(img, mark);
    return button;
  }

  function closePlayer(restoreFocus) {
    if (!active) return;
    var button = buildPlayButton(active.id, active.title);
    active.stage.replaceChildren(button);
    active = null;
    if (restoreFocus) button.focus();
  }

  function openPlayer(button) {
    var id = button.getAttribute("data-video-id");
    var title = button.getAttribute("data-title");
    var stage = button.closest(".video-stage");
    if (!id || !title || !stage) return;
    if (active) closePlayer(false);
    var frame = document.createElement("iframe");
    frame.className = "video-frame";
    frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1";
    frame.title = title;
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    var close = document.createElement("button");
    close.type = "button";
    close.className = "video-close";
    close.textContent = "Close player";
    close.addEventListener("click", function () { closePlayer(true); });
    stage.replaceChildren(frame, close);
    active = { id: id, title: title, stage: stage };
    frame.focus();
  }

  document.querySelectorAll(".series-list").forEach(function (series) {
    series.addEventListener("click", function (event) {
      var button = event.target.closest(".video-play");
      if (!button || !series.contains(button)) return;
      openPlayer(button);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var dialog = document.getElementById("photo-lightbox");
    if (dialog && dialog.open) return;
    if (active) {
      event.preventDefault();
      closePlayer(true);
      return;
    }
    closeNav();
  });

  var dialog = document.getElementById("photo-lightbox");
  var lightboxImg = document.getElementById("photo-lightbox-img");
  var lightboxCaption = document.getElementById("photo-lightbox-caption");
  var photos = Array.prototype.slice.call(document.querySelectorAll(".js-photo"));
  var photoIndex = 0;
  var photoOpener = null;

  function showPhoto(index) {
    var item = photos[index];
    if (!item || !lightboxImg) return;
    photoIndex = index;
    lightboxImg.src = item.getAttribute("data-full");
    lightboxImg.alt = item.getAttribute("data-caption") || "";
    if (lightboxCaption) lightboxCaption.textContent = item.getAttribute("data-caption") || "";
  }

  if (dialog && photos.length) {
    photos.forEach(function (button, index) {
      button.addEventListener("click", function () {
        photoOpener = button;
        showPhoto(index);
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        var close = document.getElementById("photo-close");
        if (close) close.focus();
      });
    });
    document.getElementById("photo-close").addEventListener("click", function () {
      dialog.close();
    });
    document.getElementById("photo-prev").addEventListener("click", function () {
      showPhoto((photoIndex - 1 + photos.length) % photos.length);
    });
    document.getElementById("photo-next").addEventListener("click", function () {
      showPhoto((photoIndex + 1) % photos.length);
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showPhoto((photoIndex + 1) % photos.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPhoto((photoIndex - 1 + photos.length) % photos.length);
      }
    });
    dialog.addEventListener("close", function () {
      if (photoOpener && typeof photoOpener.focus === "function") photoOpener.focus();
    });
  }
})();
