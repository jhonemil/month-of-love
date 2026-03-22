const letters = document.querySelectorAll(".letter");
const lettersContainer = document.querySelector(".letters");
let zIndexCounter = 10;

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const shuffledThings = Array.from(letters);
shuffleArray(shuffledThings);

shuffledThings.forEach((letter) => {
  lettersContainer.appendChild(letter);
  const center =
    document.querySelector(".cssletter").offsetWidth / 2 -
    letter.offsetWidth / 2;
  letter.style.left = `${center}px`;

  function isOverflown(element) {
    return (
      element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth
    );
  }

  if (!isOverflown(letter)) {
    letter.classList.add("center");
  }
  let offsetX, offsetY;
  const startDrag = (e) => {
    if (e.target.tagName !== "BUTTON") {
      letter.classList.add("expanded");
      const isTouch = e.type.includes("touch");
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;
      const rect = letter.getBoundingClientRect();

      letter.style.position = "fixed";
      letter.style.left = `${rect.left}px`;
      letter.style.top = `${rect.top}px`;

      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;

      letter.style.zIndex = zIndexCounter++;
      const moveAt = (posX, posY) => {
        letter.style.left = `${posX - offsetX}px`;
        letter.style.top = `${posY - offsetY}px`;
      };
      const onMove = (moveEvent) => {
        const mx = moveEvent.type.includes("touch") ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const my = moveEvent.type.includes("touch") ? moveEvent.touches[0].clientY : moveEvent.clientY;
        moveAt(mx, my);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
    }
  };
  letter.addEventListener("mousedown", startDrag);
  letter.addEventListener("touchstart", startDrag, { passive: false });
});
document.querySelector("#openEnvelope").addEventListener("click", () => {
  document.querySelector(".envelope").classList.toggle("active");
});
const closeButtons = document.querySelectorAll(".closeLetter");
closeButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    const letter = e.target.closest('.letter');
    if (letter) {
      letter.classList.remove("expanded");
      letter.style.position = "";
      const center = document.querySelector(".cssletter").offsetWidth / 2 - letter.offsetWidth / 2;
      letter.style.left = `${center}px`;
      letter.style.top = "1rem";
      letter.style.zIndex = "";
    }
    document.querySelector(".envelope").classList.add("active");
  });
});

document.addEventListener("click", (e) => {
  const envelope = document.querySelector(".envelope");
  const isClickInsideEnvelope = envelope.contains(e.target);
  const isClickInsideLetter = e.target.closest('.letter');
  
  if (!isClickInsideEnvelope && !isClickInsideLetter && envelope.classList.contains("active")) {
    envelope.classList.remove("active");
  }
});
