class DictionaryApp {
    constructor() {
        this.apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
        this.currentAudio = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTheme();
        this.loadFont();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.results = document.getElementById('results');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.themeToggle = document.getElementById('themeToggle');
        this.fontSelect = document.getElementById('fontSelect');
        this.playBtn = document.getElementById('playBtn');
        
        // Result elements
        this.wordTitle = document.getElementById('wordTitle');
        this.phonetic = document.getElementById('phonetic');
        this.definitions = document.getElementById('definitions');
        this.synonyms = document.getElementById('synonyms');
        this.sourceLink = document.getElementById('sourceLink');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === '') {
                this.showDefaultContent();
            }
        });
        
        this.themeToggle.addEventListener('change', () => this.toggleTheme());
        this.fontSelect.addEventListener('change', () => this.changeFont());
        this.playBtn.addEventListener('click', () => this.playPronunciation());
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiUrl}${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error('Word not found');
            }
            
            const data = await response.json();
            this.displayResults(data[0]);
            
        } catch (error) {
            this.showError();
        }
    }

    displayResults(data) {
        this.hideAll();
        this.results.classList.remove('hidden');

        // Word and phonetic
        this.wordTitle.textContent = data.word;
        const phoneticText = data.phonetics?.find(p => p.text)?.text || '';
        this.phonetic.textContent = phoneticText;

        // Store audio for pronunciation
        const audioPhonetic = data.phonetics?.find(p => p.audio && p.audio.trim() !== '');
        this.currentAudio = audioPhonetic ? audioPhonetic.audio : null;
        
        // Update play button visibility
        this.playBtn.style.display = this.currentAudio ? 'flex' : 'none';

        // Clear previous content
        this.results.innerHTML = `
            <div class="word-header">
                <h1 id="wordTitle">${data.word}</h1>
                ${this.currentAudio ? `
                <button id="playBtn" class="play-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                </button>` : ''}
            </div>
            
            <p id="phonetic" class="phonetic">${phoneticText}</p>
        `;

        // Add meanings
        data.meanings.forEach(meaning => {
            const meaningSection = document.createElement('div');
            meaningSection.className = 'definitions-section';
            
            meaningSection.innerHTML = `
                <h2 class="part-of-speech">${meaning.partOfSpeech}</h2>
                <p class="meaning-label">Meaning</p>
                <ul class="definitions-list">
                    ${meaning.definitions.slice(0, 5).map(def => 
                        `<li>${def.definition}${def.example ? `<br><em>"${def.example}"</em>` : ''}</li>`
                    ).join('')}
                </ul>
                ${meaning.synonyms && meaning.synonyms.length > 0 ? `
                <div class="synonyms-section">
                    <span class="synonyms-label">Synonyms</span>
                    <span class="synonyms-text">${meaning.synonyms.slice(0, 5).join(', ')}</span>
                </div>` : ''}
            `;
            
            this.results.appendChild(meaningSection);
        });

        // Add source
        const sourceSection = document.createElement('div');
        sourceSection.className = 'source-section';
        sourceSection.innerHTML = `
            <span class="source-label">Source</span>
            <a href="${data.sourceUrls?.[0] || '#'}" target="_blank" class="source-link">${data.sourceUrls?.[0] || 'Dictionary API'}</a>
        `;
        this.results.appendChild(sourceSection);

        // Re-bind play button event
        const newPlayBtn = document.getElementById('playBtn');
        if (newPlayBtn) {
            newPlayBtn.addEventListener('click', () => this.playPronunciation());
        }
    }

    showDefaultContent() {
        this.hideAll();
        this.results.classList.remove('hidden');
        this.currentAudio = null;
        
        this.results.innerHTML = `
            <div class="word-header">
                <h1 id="wordTitle">keyboard</h1>
                <button id="playBtn" class="play-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                </button>
            </div>
            
            <p id="phonetic" class="phonetic">/ˈkiːbɔːd/</p>

            <div class="definitions-section">
                <h2 class="part-of-speech">noun</h2>
                <p class="meaning-label">Meaning</p>
                <ul class="definitions-list">
                    <li>A set of keys used to operate a typewriter, computer, etc.</li>
                    <li>A component of many instruments including the piano, organ, and harpsichord consisting of usually black and white keys that cause different tones to be produced when struck.</li>
                    <li>A device with keys or a set of buttons used to lock or unlock something from the keyboard device.</li>
                </ul>
                
                <div class="synonyms-section">
                    <span class="synonyms-label">Synonyms</span>
                    <span class="synonyms-text">electronic keyboard</span>
                </div>
            </div>

            <div class="definitions-section">
                <h2 class="part-of-speech">verb</h2>
                <p class="meaning-label">Meaning</p>
                <ul class="definitions-list">
                    <li>To type on a computer keyboard</li>
                    <li>To configure a keyboard key</li>
                </ul>
            </div>

            <div class="source-section">
                <span class="source-label">Source</span>
                <a href="https://en.wiktionary.org/wiki/keyboard" class="source-link">https://en.wiktionary.org/wiki/keyboard</a>
            </div>
        `;
    }

    playPronunciation() {
        if (this.currentAudio) {
            const audio = new Audio(this.currentAudio);
            audio.play().catch(e => console.log('Audio playback failed:', e));
        }
    }

    showLoading() {
        this.hideAll();
        this.loading.classList.remove('hidden');
    }

    showError() {
        this.hideAll();
        this.error.classList.remove('hidden');
    }

    hideAll() {
        this.results.classList.add('hidden');
        this.loading.classList.add('hidden');
        this.error.classList.add('hidden');
    }

    toggleTheme() {
        const isDark = this.themeToggle.checked;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const isDark = savedTheme === 'dark';
        this.themeToggle.checked = isDark;
        document.body.setAttribute('data-theme', savedTheme);
    }

    changeFont() {
        const selectedFont = this.fontSelect.value;
        document.body.className = selectedFont;
        localStorage.setItem('font', selectedFont);
    }

    loadFont() {
        const savedFont = localStorage.getItem('font') || 'sans-serif';
        this.fontSelect.value = savedFont;
        document.body.className = savedFont;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DictionaryApp();
});