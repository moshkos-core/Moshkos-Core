/**
 * MOSHKO'S CORE — Language / Translation System
 * -----------------------------------------------
 * Defaults to English on a brand-new browser session.
 * Persists the chosen language across SPA page navigations
 * using sessionStorage (resets when the browser tab is closed).
 *
 * Usage:
 *   window.MoshkoLang.toggle()   — switch language
 *   window.MoshkoLang.apply()    — re-apply current language to DOM
 *   data-i18n="key"              — mark an element for translation
 */

window.MoshkoLang = {
    // Read from sessionStorage so SPA navigation keeps the setting.
    // Falls back to 'en' on first visit (sessionStorage is empty).
    current: sessionStorage.getItem('moshko_lang') || 'en',

    translations: {
        en: {
            // ── Navbar ──────────────────────────────────────────────
            'nav.home': 'Home',
            'nav.updates': 'Updates',
            'nav.timeline': 'Timeline',
            'nav.minecraft': 'Minecraft',
            'nav.games': 'Games',
            'nav.bar': 'Bar Menu',

            // ── Month names ──────────────────────────────────────────
            'month.january': 'January',
            'month.february': 'February',
            'month.march': 'March',
            'month.april': 'April',
            'month.may': 'May',
            'month.june': 'June',
            'month.july': 'July',
            'month.august': 'August',
            'month.september': 'September',
            'month.october': 'October',
            'month.november': 'November',
            'month.december': 'December',

            // ── Home page ────────────────────────────────────────────
            'home.title': "Welcome to Moshko's Core!",
            'home.subtitle': "Moshko's Core - A place where ideas come to life!",
            'home.btn.bar': 'Visit the Bar',
            'home.btn.minecraft': 'Explore Minecraft',
            'home.btn.games': 'Play Games',
            'home.about.title': 'About Me',
            'home.about.p1': 'Cooking and chilling at the beach are my favorite ways to relax and recharge. These hobbies grant me the personal space where I can focus on myself and bridge tranquility with creativity.',
            'home.about.p2': 'I have been playing Minecraft for 12 years, I specialize in building and managing professional Discord servers, including design and customization. I combine creativity and management to bring value to the communities I am a part of.',

            // ── Updates page ─────────────────────────────────────────
            'updates.title': 'Latest Updates',
            'updates.subtitle': "Stay current with what's new in Moshko's Core!",

            // ── Timeline page ────────────────────────────────────────
            'timeline.title': 'Parlamentum Staff Timeline',
            'timeline.subtitle': 'My Path Through the Parlamentum Staff!',
            'timeline.stat.roles': 'Role Count',
            'timeline.stat.tenure': 'Service Tenure',
            'timeline.stat.since': 'Commissioned In',

            // ── Minecraft page ───────────────────────────────────────
            'minecraft.title': 'Minecraft Specialty',
            'minecraft.subtitle': "Custom packs and epic builds from the Moshko's Core!",
            'minecraft.card.pack.title': 'Resource Pack',
            'minecraft.card.pack.desc': 'Explore my custom resource pack!',
            'minecraft.card.pack.btn': 'View Resource Pack',
            'minecraft.card.builds.title': 'My Builds',
            'minecraft.card.builds.desc': 'Explore my showcase of incredible Minecraft builds!',
            'minecraft.card.builds.btn': 'View Gallery',
            'minecraft.card.timeline.title': 'Parlamentum Timeline',
            'minecraft.card.timeline.desc': 'My timeline in the Parlamentum staff!',
            'minecraft.card.timeline.btn': 'View Timeline',
            'timeline.back': 'Back to Minecraft Page',
            'minecraft.features.heading': 'What Makes Our Pack Special?',
            'minecraft.feat.doors.title': '🚪 Enhanced Doors',
            'minecraft.feat.doors.desc': 'Custom 3D models for all doors and trapdoors, adding depth and detail to every wood type.',
            'minecraft.feat.menus.title': '🖥️ Clean Menus',
            'minecraft.feat.menus.desc': 'Updated textures for all containers and interfaces, making crafting and inventory management cleaner.',
            'minecraft.feat.plants.title': '🌿 Alive Vegetation',
            'minecraft.feat.plants.desc': 'Subtle, performance-friendly movement for plants using default internal shaders.',

            // ── Resource Pack page ───────────────────────────────────
            'rp.title': "Moshko's Resource Pack",
            'rp.subtitle': 'Clean, Optimized, Vanilla-Friendly!',
            'rp.back': 'Back to Minecraft Page',
            'rp.overview.title': 'Overview',
            'rp.overview.desc': 'A clean, lightweight resource pack that refreshes GUI menus, enhances block models (especially doors and trapdoors), and adds subtle vegetation animations using internal shaders—all while keeping the vanilla Minecraft feel.',
            'rp.feat.doors.title': '🚪 Enhanced Doors',
            'rp.feat.doors.desc': 'Doors and trapdoors have been redesigned with custom 3D models and depth for all wood types.',
            'rp.feat.menus.title': '🖥️ Clean Interface',
            'rp.feat.menus.desc': 'Menu refresh—updated textures for Crafting Tables, Furnaces, Anvils, and more.',
            'rp.feat.nature.title': '🌿 Nature & Fixes',
            'rp.feat.nature.li1': 'Subtle plant movement (Internal Shaders)',
            'rp.feat.nature.li2': 'Model fixes for Mushrooms, Vines, and End Rods',
            'rp.feat.nature.li3': 'Redesigned Sun & Moon',
            'rp.feat.nature.li4': 'Secret sound for Totem usage',
            'rp.feat.secret.title': 'Secret Feature',
            'rp.feat.secret.desc': 'Try placing an End Rod on your head and see what happens...',
            'rp.download.title': 'Download Resource Pack',
            'rp.download.btn': '⬇️ Click Here ⬇️',

            // ── Builds page ──────────────────────────────────────────
            'builds.title': 'Build Gallery',
            'builds.subtitle': 'A collection of my most epic Minecraft creations!',
            'builds.back': 'Back to Minecraft Page',

            // ── Games page ───────────────────────────────────────────
            'games.title': 'Games',
            'games.subtitle': "Play fun mini-games made by Moshko's Core!",
            'game.clicker.title': 'Dragon Clicker',
            'game.clicker.desc': 'Hunt the targets, gain the brew!',
            'game.snake.title': 'Cosmic Snake',
            'game.snake.desc': 'Collect Beer Mugs, grow your tail!',
            'game.2048.title': 'Dragon 2048',
            'game.2048.desc': 'Combine brews to reach the Golden Dragon!',
            'game.flappy.title': 'Flappy Dragon',
            'game.flappy.desc': 'Dodge the pipes and reach the nebula!',
            'game.stack.title': 'Brew Stack',
            'game.stack.desc': 'Stack the crates to the stars!',
            'game.race.title': 'Dragon Wing Race',
            'game.race.desc': 'High-speed arcade vector racing!',
            'game.pong.title': 'Beer Pong Galaxy',
            'game.pong.desc': 'Master the neon cosmic bounce!',
            'game.breath.title': 'Dragon Breath',
            'game.breath.desc': 'Defend the brewery with cosmic fire!',

            // ── Footer ───────────────────────────────────────────────
            'footer.credit': "🍔 Created By Shahar.M 🍺",

            // ── Skin panel ───────────────────────────────────────────
            'skin.placeholder': 'Username',
            'skin.btn.change': 'Change Skin',
            'skin.btn.reset': 'Reset',
            'skin.btn.grenade': 'Drag & Throw Grenade (G)',

            // ── Bar page ─────────────────────────────────────────────
            'bar.title': "🍸 Moshko's Bar",
            'bar.category.whiskey': 'Whiskey',
            'bar.category.vodka': 'Vodka',
            'bar.category.ginrum': 'Gin & Rum',
            'bar.category.tequila': 'Tequila',
            'bar.category.brandy': 'Brandy',
            'bar.category.wine': 'Wine',
            'bar.category.spiritsaperitifsfortified': 'Spirits / Aperitifs & Fortified',
            'bar.category.liqueurs': 'Liqueurs',
            'bar.category.anise': 'Anise',
        },

        he: {
            // ── Navbar ──────────────────────────────────────────────
            'nav.home': 'בית',
            'nav.updates': 'עדכונים',
            'nav.timeline': 'ציר זמן',
            'nav.minecraft': 'מיינקראפט',
            'nav.games': 'משחקים',
            'nav.bar': 'תפריט הבר',

            // ── Month names (Hebrew) ──────────────────────────────────
            'month.january': 'ינואר',
            'month.february': 'פברואר',
            'month.march': 'מרץ',
            'month.april': 'אפריל',
            'month.may': 'מאי',
            'month.june': 'יוני',
            'month.july': 'יולי',
            'month.august': 'אוגוסט',
            'month.september': 'ספטמבר',
            'month.october': 'אוקטובר',
            'month.november': 'נובמבר',
            'month.december': 'דצמבר',

            // ── Home page ────────────────────────────────────────────
            'home.title': "ברוכים הבאים ל-Moshko's Core!",
            'home.subtitle': "Moshko's Core - מקום שבו רעיונות הופכים למציאות!",
            'home.btn.bar': 'בקר בבר',
            'home.btn.minecraft': 'גלה את המיינקראפט',
            'home.btn.games': 'שחק משחקים',
            'home.about.title': 'קצת עליי',
            'home.about.p1': 'בישול ושהייה בים הם הדרכים האהובות עליי להירגע ולהטעין מצברים. התחביבים האלו מעניקים לי את המרחב האישי שבו אני יכול להתמקד בעצמי ולחבר בין שלווה ליצירתיות.',
            'home.about.p2': 'אני משחק במיינקראפט כבר 12 שנים, אני מתמחה בבנייה וניהול שרתי דיסקורד מקצועיים, כולל עיצוב והתאמה אישית. אני משלב יצירתיות וניהול כדי להביא ערך לקהילות שאני חלק מהן.',

            // ── Updates page ─────────────────────────────────────────
            'updates.title': 'עדכונים אחרונים',
            'updates.subtitle': 'הישאר מעודכן עם מה שחדש!',

            // ── Timeline page ────────────────────────────────────────
            'timeline.title': 'ציר הזמן של צוות פרלמנטום',
            'timeline.subtitle': '!המסלול שלי בצוות הפרלמנטום',
            'timeline.stat.roles': 'מספר תפקידים',
            'timeline.stat.tenure': 'זמן בצוות',
            'timeline.stat.since': 'שנת הצטרפות',

            // ── Minecraft page ───────────────────────────────────────
            'minecraft.title': 'התמחות מיינקראפט',
            'minecraft.subtitle': 'חבילות מותאמות ובניות מדהימות!',
            'minecraft.card.pack.title': 'חבילת משאבים',
            'minecraft.card.pack.desc': 'גלה את חבילת המשאבים המותאמת שלי!',
            'minecraft.card.pack.btn': 'צפה בחבילת המשאבים',
            'minecraft.card.builds.title': 'הבניות שלי',
            'minecraft.card.builds.desc': 'גלה את הויטרינה של בניות מיינקראפט המדהימות שלי!',
            'minecraft.card.builds.btn': 'צפה בגלריה',
            'minecraft.card.timeline.title': 'ציר זמן פרלמנטום',
            'minecraft.card.timeline.desc': 'ציר הזמן שלי בצוות הפרלמנטום!',
            'minecraft.card.timeline.btn': 'צפה בציר הזמן',
            'timeline.back': 'חזרה לדף מיינקראפט',
            'minecraft.features.heading': '?מה הופך את החבילה שלנו למיוחדת',
            'minecraft.feat.doors.title': 'דלתות משופרות 🚪',
            'minecraft.feat.doors.desc': 'מודלים תלת-ממדיים מותאמים לכל הדלתות ודלתות המלכודת, עם עומק ופרטים לכל סוג עץ.',
            'minecraft.feat.menus.title': 'תפריטים נקיים 🖥️',
            'minecraft.feat.menus.desc': 'טקסטורות מעודכנות לכל המיכלים והממשקים, שהופכות את המלאכה וניהול המלאי לנקיים יותר.',
            'minecraft.feat.plants.title': 'צמחייה חיה 🌿',
            'minecraft.feat.plants.desc': 'תנועה עדינה וידידותית לביצועים לצמחים תוך שימוש בצלליות הפנימיות של המשחק.',

            // ── Resource Pack page ───────────────────────────────────
            'rp.title': "חבילת המשאבים של מושקו",
            'rp.subtitle': 'נקייה, מותאמת ווניל-ידידותית!',
            'rp.back': 'חזרה לדף מיינקראפט',
            'rp.overview.title': 'סקירה כללית',
            'rp.overview.desc': 'חבילת משאבים קלה ונקייה שמרעננת את תפריטי ה-GUI, משפרת מודלים של בלוקים (במיוחד דלתות), ומוסיפה אנימציות צמחייה עדינות — תוך שמירה על תחושת ה-Vanilla.',
            'rp.feat.doors.title': 'דלתות משופרות 🚪',
            'rp.feat.doors.desc': 'דלתות ודלתות מלכודת עוצבו מחדש עם מודלים תלת-ממדיים מותאמים לכל סוגי העץ.',
            'rp.feat.menus.title': 'ממשק נקי 🖥️',
            'rp.feat.menus.desc': 'רענון תפריטים — טקסטורות מעודכנות לשולחנות מלאכה, כבשנים, סדנים ועוד.',
            'rp.feat.nature.title': 'טבע ותיקונים 🌿',
            'rp.feat.nature.li1': 'תנועת צמחים עדינה (צלליות פנימיות)',
            'rp.feat.nature.li2': 'תיקוני מודלים לפטריות, גפנים ואנרגית קצה',
            'rp.feat.nature.li3': 'שמש וירח מעוצבים מחדש',
            'rp.feat.nature.li4': 'צליל סודי לשימוש בטוטם',
            'rp.feat.secret.title': 'תכונה סודית',
            'rp.feat.secret.desc': 'נסה להניח מוט קצה על הראש — תראה מה קורה...',
            'rp.download.title': 'הורד את חבילת המשאבים',
            'rp.download.btn': '⬇️ לחץ כאן ⬇️',

            // ── Builds page ──────────────────────────────────────────
            'builds.title': 'גלריית הבניות',
            'builds.subtitle': 'אוסף היצירות המרהיבות שלי במיינקראפט!',
            'builds.back': 'חזרה לדף מיינקראפט',

            // ── Games page ───────────────────────────────────────────
            'games.title': 'משחקים',
            'games.subtitle': "שחק מיני-משחקים כיפיים!",
            'game.clicker.title': 'לוחץ הדרקון',
            'game.clicker.desc': 'ציד יעדים, השג את המשקה!',
            'game.snake.title': 'נחש קוסמי',
            'game.snake.desc': 'אסוף ספלי בירה, הגדל את הזנב!',
            'game.2048.title': 'דרקון 2048',
            'game.2048.desc': 'שלב משקאות כדי להגיע לדרקון הזהב!',
            'game.flappy.title': 'דרקון מעופף',
            'game.flappy.desc': 'תמנע מהצינורות והגע לערפילית!',
            'game.stack.title': 'מגדל המשקאות',
            'game.stack.desc': 'ערום את הארגזים עד לכוכבים!',
            'game.race.title': 'מרוץ כנפי הדרקון',
            'game.race.desc': 'מרוץ וקטורי מהיר בסגנון ארקייד!',
            'game.pong.title': 'גלקסיית בירה פונג',
            'game.pong.desc': 'שלוט בניתור הניאון הקוסמי!',
            'game.breath.title': 'נשיפת הדרקון',
            'game.breath.desc': 'הגן על המבשלה עם אש קוסמית!',

            // ── Contact Info ─────────────────────────────────────────
            'contact.title': '🔗 פרטי התקשרות',

            // ── Footer ───────────────────────────────────────────────
            'footer.credit': "🍔 נוצר על ידי שחר.מ 🍺",

            // ── Skin panel ───────────────────────────────────────────
            'skin.placeholder': 'שם משתמש',
            'skin.btn.change': 'שינוי סקין',
            'skin.btn.reset': 'איפוס',
            'skin.btn.grenade': '(G) גרור וזרוק רימון',

            // ── Bar page ─────────────────────────────────────────────
            'bar.title': '🍸 הבר של מושקו',
            'bar.category.whiskey': 'וויסקי',
            'bar.category.vodka': 'וודקה',
            'bar.category.ginrum': 'ג׳ין ורום',
            'bar.category.tequila': 'טקילה',
            'bar.category.brandy': 'ברנדי',
            'bar.category.wine': 'יין',
            'bar.category.spiritsaperitifsfortified': 'משקאות חריפים / אפריטיפים ומחוזקים',
            'bar.category.liqueurs': 'ליקרים',
            'bar.category.anise': 'אניס',
        }
    },

    /** Translate an array of month names using the current language. */
    monthNames() {
        const keys = ['month.january', 'month.february', 'month.march', 'month.april',
            'month.may', 'month.june', 'month.july', 'month.august',
            'month.september', 'month.october', 'month.november', 'month.december'];
        return keys.map(k => this.t(k));
    },

    /** Get a translated string by key (falls back to English, then the key itself). */
    t(key) {
        return (this.translations[this.current] || {})[key]
            || (this.translations['en'] || {})[key]
            || key;
    },

    /** Apply current language to every [data-i18n] element in the DOM.
     *  The navbar always stays LTR regardless of language. */
    apply() {
        const isHe = this.current === 'he';

        // Set lang + dir on <html> for page content
        // Skip on bar page — keep English fonts and LTR layout
        const isBarPage = window.location.pathname.endsWith('bar.html');
        if (!isBarPage) {
            document.documentElement.setAttribute('lang', this.current);
            document.documentElement.setAttribute('dir', isHe ? 'rtl' : 'ltr');
        }

        // Navbar ALWAYS stays LTR (left-to-right layout, same side)
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.setAttribute('dir', 'ltr');

        // About-me bio card: explicitly set direction so Hebrew text is RTL
        const bioContent = document.getElementById('bioContent');
        if (bioContent) {
            bioContent.style.direction = isHe ? 'rtl' : 'ltr';
            bioContent.style.textAlign = isHe ? 'right' : 'left';
        }

        // Translate all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.t(key);
            if (el.tagName === 'INPUT') {
                el.placeholder = val;
            } else {
                el.textContent = val;
            }
        });

        // Keep the toggle button in sync
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.setAttribute('dir', 'ltr'); // toggle button always LTR
            btn.setAttribute('data-lang', this.current);
            btn.title = isHe ? 'Switch to English' : 'עבור לעברית';
            const label = btn.querySelector('.lang-toggle-label');
            if (label) label.textContent = isHe ? 'HE' : 'EN';
        }
    },

    /** Switch between English and Hebrew. */
    toggle() {
        this.current = this.current === 'en' ? 'he' : 'en';
        // Persist within this browser session
        sessionStorage.setItem('moshko_lang', this.current);
        this.apply();
        window.dispatchEvent(new Event('lang-change'));
        if (window.MoshkoSounds && window.MoshkoSounds.play) {
            window.MoshkoSounds.play('click');
        }
    }
};
