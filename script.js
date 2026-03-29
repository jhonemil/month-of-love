const supabaseUrl = 'https://eodccponqwzqnozbnlra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZGNjcG9ucXd6cW5vemJubHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjE4NDUsImV4cCI6MjA5MDI5Nzg0NX0.j8IWTRFIt1DBF6t7loa-xqI2cx4nGpH0YZ0V0DiyltM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const lettersContainer = document.querySelector(".letters");
let zIndexCounter = 10;

// Reusable function to make a letter draggable
function makeLetterDraggable(letter) {
  function isOverflown(element) {
    return (
      element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth
    );
  }

  // We set a short timeout to let the DOM apply styles before checking overflow
  setTimeout(() => {
    if (!isOverflown(letter)) {
      letter.classList.add("center");
    }
  }, 10);

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
}

// Envelope open/close Logic
document.querySelector("#openEnvelope").addEventListener("click", () => {
  document.querySelector(".envelope").classList.toggle("active");
});

document.addEventListener("click", (e) => {
  const envelope = document.querySelector(".envelope");
  const isClickInsideEnvelope = envelope.contains(e.target);
  const isClickInsideLetter = e.target.closest('.letter');
  
  if (!isClickInsideEnvelope && !isClickInsideLetter && envelope.classList.contains("active")) {
    envelope.classList.remove("active");
  }
});

// Fetch letters from Supabase
async function fetchLetters() {
  const { data, error } = await supabaseClient
    .from('letters')
    .select('*')
    .order('letter_id', { ascending: false }); // Sort descending so first letter is at the bottom

  if (error) {
    console.error('Error fetching letters:', error);
    return;
  }

  data.forEach((item) => {
    // 1. Create the blockquote container
    const letter = document.createElement('blockquote');
    letter.className = 'letter'; // class 'center' will be added automatically later
    letter.id = item.letter_id;
    letter.tabIndex = 0;
    
    // 2. Create the close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'closeLetter';
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      letter.classList.remove("expanded");
      letter.style.position = "";
      
      const center = document.querySelector(".cssletter").offsetWidth / 2 - letter.offsetWidth / 2;
      letter.style.left = `${center}px`;
      letter.style.top = "1rem";
      letter.style.zIndex = "";
      
      document.querySelector(".envelope").classList.add("active");
    });
    
    // 3. Create paragraph for message
    const pTag = document.createElement('p');
    pTag.textContent = item.message;
    
    // 4. Create cite for date
    const citeTag = document.createElement('cite');
    citeTag.textContent = item.date_created;
    
    // Append children
    letter.appendChild(closeBtn);
    letter.appendChild(pTag);
    letter.appendChild(citeTag);
    lettersContainer.appendChild(letter);

    // Initial positioning setup
    setTimeout(() => {
      const centerLeft = document.querySelector(".cssletter").offsetWidth / 2 - letter.offsetWidth / 2;
      letter.style.left = `${centerLeft}px`;
    }, 10);
    
    // Make it draggable
    makeLetterDraggable(letter);
  });
}

// Initialize
fetchLetters();
