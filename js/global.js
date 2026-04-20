/**
 * 全局脚本 - 崖城风骨
 * 国赛级多页面Web作品
 */

// ===== 工具函数 =====
const utils = {
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    on(element, event, handler, options = false) {
        if (element) {
            element.addEventListener(event, handler, options);
        }
    },

    throttle(fn, delay) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= delay) {
                lastTime = now;
                fn.apply(this, args);
            }
        };
    },

    scrollTo(element, offset = 0) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    },

    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        }
    }
};

// ===== 导航栏 =====
const Navbar = {
    navbar: null,
    toggle: null,
    menu: null,
    links: null,

    init() {
        this.navbar = document.querySelector('.navbar');
        this.toggle = document.querySelector('.nav-toggle');
        this.menu = document.querySelector('.nav-menu');
        this.links = document.querySelectorAll('.nav-link');

        if (!this.navbar) return;

        this.bindEvents();
        this.handleScroll();
    },

    bindEvents() {
        window.addEventListener('scroll', utils.throttle(() => {
            this.handleScroll();
        }, 100));

        if (this.toggle) {
            this.toggle.addEventListener('click', () => {
                this.menu.classList.toggle('active');
            });
        }

        this.links.forEach(link => {
            link.addEventListener('click', () => {
                this.menu.classList.remove('active');
            });
        });
    },

    handleScroll() {
        if (window.pageYOffset > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
};

// ===== 页面进度条 =====
const PageProgress = {
    progressBar: null,

    init() {
        this.progressBar = document.querySelector('.page-progress');
        if (!this.progressBar) return;

        window.addEventListener('scroll', utils.throttle(() => {
            this.update();
        }, 50));
    },

    update() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        this.progressBar.style.height = progress + '%';
    }
};

// ===== 全局控件 =====
const GlobalControls = {
    audioBtn: null,
    topBtn: null,
    isPlaying: false,
    audioElement: null,
    volume: 0.3,
    progressInterval: null,
    audioPanel: null,
    volumeSlider: null,
    progressBar: null,
    currentTimeEl: null,
    durationEl: null,
    playPauseBtn: null,

    init() {
        this.audioBtn = document.getElementById('audio-btn');
        this.topBtn = document.getElementById('top-btn');
        this.audioPanel = document.getElementById('audio-panel');
        this.volumeSlider = document.getElementById('volume-slider');
        this.progressBar = document.getElementById('audio-progress');
        this.currentTimeEl = document.getElementById('audio-current-time');
        this.durationEl = document.getElementById('audio-duration');
        this.playPauseBtn = document.getElementById('audio-play-pause');

        this.loadAudioState();
        this.bindEvents();
        this.initAudioPanel();
    },

    bindEvents() {
        if (this.audioBtn) {
            this.audioBtn.addEventListener('click', () => this.toggleAudio());
        }

        if (this.topBtn) {
            this.topBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 播放/暂停按钮（面板内）
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.toggleAudio());
        }

        // 音量调节
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }

        // 进度条控制
        if (this.progressBar) {
            this.progressBar.addEventListener('click', (e) => {
                if (this.audioElement) {
                    const rect = this.progressBar.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    this.audioElement.currentTime = percent * this.audioElement.duration;
                    this.updateProgress();
                }
            });
        }

        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (this.audioPanel && !this.audioPanel.contains(e.target) && !this.audioBtn.contains(e.target)) {
                this.hideAudioPanel();
            }
        });
    },

    initAudioPanel() {
        if (this.volumeSlider && this.audioElement) {
            this.volumeSlider.value = this.volume * 100;
        }
    },

    toggleAudioPanel() {
        if (this.audioPanel) {
            if (this.audioPanel.classList.contains('active')) {
                this.hideAudioPanel();
            } else {
                this.showAudioPanel();
            }
        } else {
            this.toggleAudio();
        }
    },

    showAudioPanel() {
        if (this.audioPanel) {
            this.audioPanel.classList.add('active');
            this.updateProgress();
        }
    },

    hideAudioPanel() {
        if (this.audioPanel) {
            this.audioPanel.classList.remove('active');
        }
    },

    loadAudioState() {
        const savedState = utils.storage.get('audioState', null);
        if (savedState) {
            this.isPlaying = savedState.isPlaying;
            this.volume = savedState.volume || 0.3;
            
            if (this.isPlaying && this.audioBtn) {
                this.audioBtn.classList.add('playing');
                this.updateAudioIcon(true);
            }
            
            if (this.isPlaying) {
                this.tryResumeAudio(savedState.currentTime || 0);
            }
        }
    },

    saveAudioState() {
        const state = {
            isPlaying: this.isPlaying,
            volume: this.volume,
            currentTime: this.audioElement ? this.audioElement.currentTime : 0
        };
        utils.storage.set('audioState', state);
    },

    startProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        this.progressInterval = setInterval(() => {
            if (this.isPlaying && this.audioElement) {
                this.saveAudioState();
                this.updateProgress();
            }
        }, 1000);
    },

    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    },

    updateProgress() {
        if (this.audioElement && this.progressBar) {
            const percent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            const progressFill = this.progressBar.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = percent + '%';
            }
            
            if (this.currentTimeEl) {
                this.currentTimeEl.textContent = this.formatTime(this.audioElement.currentTime);
            }
            if (this.durationEl && this.audioElement.duration) {
                this.durationEl.textContent = this.formatTime(this.audioElement.duration);
            }
        }
    },

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }
        this.saveAudioState();
    },

    toggleAudio() {
        if (this.isPlaying) {
            this.stopAudio();
        } else {
            this.playAudio();
        }
    },

    playAudio() {
        try {
            if (!this.audioElement) {
                const audioPath = window.location.pathname.includes('/pages/') 
                    ? '../bkmusic/bgmusic.mp3'
                    : './bkmusic/bgmusic.mp3';
                this.audioElement = new Audio(audioPath);
                this.audioElement.loop = true;
                this.audioElement.volume = this.volume;
                
                // 监听音频加载完成
                this.audioElement.addEventListener('loadedmetadata', () => {
                    this.updateProgress();
                });
            }

            this.audioElement.play();
            this.isPlaying = true;
            this.audioBtn.classList.add('playing');
            this.updateAudioIcon(true);
            this.saveAudioState();
            this.startProgressTracking();
        } catch (e) {
            console.warn('音频播放不支持:', e);
        }
    },

    tryResumeAudio(savedTime) {
        setTimeout(() => {
            try {
                if (!this.audioElement) {
                    const audioPath = window.location.pathname.includes('/pages/') 
                        ? '../bkmusic/bgmusic.mp3'
                        : './bkmusic/bgmusic.mp3';
                    this.audioElement = new Audio(audioPath);
                    this.audioElement.loop = true;
                    this.audioElement.volume = this.volume;
                    
                    this.audioElement.addEventListener('loadedmetadata', () => {
                        this.updateProgress();
                    });
                }
                
                if (savedTime > 0) {
                    this.audioElement.currentTime = savedTime;
                }
                
                this.audioElement.play().then(() => {
                    this.isPlaying = true;
                    this.audioBtn.classList.add('playing');
                    this.updateAudioIcon(true);
                    this.startProgressTracking();
                }).catch(e => {
                    console.warn('自动播放被阻止:', e);
                    this.isPlaying = false;
                    this.saveAudioState();
                });
            } catch (e) {
                console.warn('音频恢复失败:', e);
            }
        }, 500);
    },

    stopAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
        }
        this.stopProgressTracking();
        this.isPlaying = false;
        this.audioBtn.classList.remove('playing');
        this.updateAudioIcon(false);
        this.saveAudioState();
    },

    updateAudioIcon(playing) {
        const svg = this.audioBtn.querySelector('svg');
        if (playing) {
            svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
        } else {
            svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
        }
        
        // 更新面板中的播放按钮图标
        if (this.playPauseBtn) {
            const playSvg = this.playPauseBtn.querySelector('svg');
            if (playing) {
                playSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
            } else {
                playSvg.innerHTML = '<path d="M8 5v14l11-7z"/>';
            }
        }
    }
};

// ===== 弹窗 =====
const Modal = {
    modal: null,
    closeBtn: null,

    init() {
        this.modal = document.querySelector('.modal');
        this.closeBtn = document.querySelector('.modal-close');

        if (!this.modal) return;

        this.bindEvents();
    },

    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    },

    show(content) {
        const modalBody = this.modal.querySelector('.modal-body');
        if (modalBody && content) {
            modalBody.innerHTML = content;
        }
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    hide() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ===== 引导蒙层 =====
const GuideOverlay = {
    overlay: null,
    closeBtn: null,

    init() {
        this.overlay = document.querySelector('.guide-overlay');
        this.closeBtn = document.querySelector('#guide-close');

        if (!this.overlay) return;

        const hasVisited = utils.storage.get('hasVisited', false);
        if (!hasVisited) {
            setTimeout(() => this.show(), 500);
        }

        this.bindEvents();
    },

    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hide();
                utils.storage.set('hasVisited', true);
            });
        }

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
                utils.storage.set('hasVisited', true);
            }
        });
    },

    show() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    hide() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ===== 滚动显示动画 =====
const ScrollReveal = {
    elements: null,
    observer: null,

    init() {
        this.elements = document.querySelectorAll('.scroll-reveal');
        if (this.elements.length === 0) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => this.observer.observe(el));
    }
};

// ===== AI智能助手（集成Deepseek API）=====
const Assistant = {
    float: null,
    header: null,
    input: null,
    searchBtn: null,
    closeBtn: null,
    minBtn: null,
    toggleBtn: null,
    chatContainer: null,
    messagesContainer: null,
    loading: null,
    quickQuestions: null,

    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    floatStartX: 0,
    floatStartY: 0,
    lastX: 0,
    lastY: 0,
    
    conversationHistory: [],
    maxHistoryLength: 10,
    isTyping: false,
    
    // 崖州古城知识库（作为备用）
    knowledgeBase: {
        history: [
            {
                id: 1,
                title: '崖州古城的起源与发展',
                category: 'history',
                summary: '崖州古城始建于南北朝时期，历经隋、唐、宋、元、明、清六个朝代的建设与发展，是海南岛历史最悠久的古城之一。',
                detail: {
                    timeline: ['南北朝时期：始建土城', '唐代：扩建为州城', '宋代：正式命名崖州', '明代：大规模修筑砖石城墙', '清代：多次重修加固'],
                    description: '崖州古城自建立以来，一直是海南岛南部的政治、经济、文化中心。其城墙周长约2.5公里，设有东、南、西、北四个城门，城内布局严谨，街道整齐，体现了古代城市规划的高超技艺。'
                }
            },
            {
                id: 2,
                title: '崖州古城的历史地位',
                category: 'history',
                summary: '崖州古城作为古代海南岛的重要门户，是海上丝绸之路的重要节点，见证了中原文化与岭南文化的交融。',
                detail: {
                    significance: ['海上丝绸之路的重要驿站', '中原文化传入海南的桥头堡', '贬官文化的重要发源地', '海南历史文化的重要象征'],
                    description: '崖州古城在历史上曾是海南岛的政治中心，许多著名文人墨客如李德裕、苏轼、赵鼎等都曾在此留下足迹，形成了独特的贬官文化。'
                }
            }
        ],
        officials: [
            {
                id: 4,
                title: '李德裕',
                category: 'officials',
                summary: '唐代著名宰相，因政治斗争被贬至崖州，在崖州期间兴修水利、发展教育，深受百姓爱戴。',
                detail: {
                    title: '唐代宰相',
                    tenure: '848年-850年',
                    achievements: ['兴修水利灌溉农田', '兴办学校教化民众', '整理地方文献', '安抚少数民族'],
                    evaluation: '李德裕在崖州期间政绩卓著，被誉为"崖州之贤"，其事迹被载入《崖州志》。'
                }
            },
            {
                id: 5,
                title: '苏轼',
                category: 'officials',
                summary: '北宋著名文学家，晚年被贬至儋州，途经崖州时留下了大量诗词作品，对海南文化产生深远影响。',
                detail: {
                    title: '翰林学士',
                    tenure: '1097年-1100年（谪居海南期间）',
                    achievements: ['传播中原文化', '培育当地学子', '创作大量诗词', '记录海南风土人情'],
                    evaluation: '苏轼的到来开启了海南文化发展的新篇章，其影响至今仍在。'
                }
            },
            {
                id: 6,
                title: '赵鼎',
                category: 'officials',
                summary: '南宋宰相，因反对秦桧投降政策被贬至崖州，在崖州坚持气节，著书立说，最终含冤而死。',
                detail: {
                    title: '南宋宰相',
                    tenure: '1145年-1147年',
                    achievements: ['坚持抗金主张', '撰写《忠正德文集》', '培养后学', '保持民族气节'],
                    evaluation: '赵鼎被誉为"南宋第一忠臣"，其忠贞不屈的精神为后人所敬仰。'
                }
            },
            {
                id: 7,
                title: '胡铨',
                category: 'officials',
                summary: '南宋著名谏官，因弹劾秦桧被贬至崖州，在崖州期间讲学授徒，传播文化，深受当地人民尊敬。',
                detail: {
                    title: '秘书少监',
                    tenure: '1148年-1159年',
                    achievements: ['创办学校', '教化百姓', '撰写史论', '传承儒家思想'],
                    evaluation: '胡铨在崖州的文化贡献被载入史册，成为崖州文化发展的重要里程碑。'
                }
            }
        ],
        architecture: [
            {
                id: 8,
                title: '崖州古城城墙',
                category: 'architecture',
                summary: '崖州古城城墙始建于唐代，历经多次修缮，是中国现存较为完整的古代城墙之一。',
                detail: {
                    structure: ['周长约2.5公里', '高约8米', '宽约6米', '设有四个城门'],
                    features: ['砖石结构', '马面防御设施', '护城河环绕', '城楼高耸'],
                    description: '崖州古城城墙是古代军事防御工程的杰出代表，其建筑工艺精湛，体现了古代劳动人民的智慧。'
                }
            },
            {
                id: 9,
                title: '崖州学宫',
                category: 'architecture',
                summary: '崖州学宫是古代崖州的最高学府，始建于宋代，是海南保存最完整的学宫建筑之一。',
                detail: {
                    layout: ['棂星门', '泮池', '大成殿', '明伦堂', '尊经阁'],
                    significance: ['传播儒家文化', '培养地方人才', '传承教育传统'],
                    description: '崖州学宫不仅是教育场所，也是地方文化活动的中心，见证了崖州文化教育的发展历程。'
                }
            },
            {
                id: 10,
                title: '迎旺塔',
                category: 'architecture',
                summary: '迎旺塔位于崖州古城东郊，建于清代，是崖州古城的标志性建筑之一。',
                detail: {
                    structure: ['八角七层楼阁式砖塔', '高约20米', '每层设有佛龛'],
                    features: ['层层收分', '飞檐翘角', '砖雕精美', '登高望远'],
                    description: '迎旺塔是古代崖州人为祈求文运昌盛而建，其建筑风格独特，具有重要的历史和艺术价值。'
                }
            }
        ],
        literature: [
            {
                id: 11,
                title: '《崖州志》',
                category: 'literature',
                summary: '《崖州志》是记载崖州历史的重要地方志，由清代知县张嶲编纂，是研究崖州历史的珍贵资料。',
                detail: {
                    content: ['地理沿革', '政治军事', '经济物产', '文化教育', '人物传记'],
                    value: ['研究崖州历史的权威资料', '记录地方文化的重要文献', '具有重要的学术价值'],
                    description: '《崖州志》详细记载了崖州从唐代到清代的历史变迁，是了解崖州历史文化的重要窗口。'
                }
            },
            {
                id: 12,
                title: '《琼台志》',
                category: 'literature',
                summary: '《琼台志》是明代海南的省级地方志，其中包含大量关于崖州的记载，是研究海南历史的重要文献。',
                detail: {
                    content: ['海南全岛地理', '各州县概况', '历史事件记录', '人物传记'],
                    value: ['海南历史的百科全书', '研究明代海南的重要依据', '具有重要的史料价值'],
                    description: '《琼台志》由明代学者唐胄编纂，是海南历史上第一部完整的省级地方志。'
                }
            },
            {
                id: 13,
                title: '苏轼海南诗词',
                category: 'literature',
                summary: '苏轼在海南期间创作了大量诗词作品，记录了他在海南的生活经历和情感体验。',
                detail: {
                    representative: ['《食荔枝》', '《儋耳》', '《和子由渑池怀旧》', '《记承天寺夜游》'],
                    theme: ['海南风光描写', '贬谪生活感悟', '人生哲理思考', '友情亲情表达'],
                    description: '苏轼的海南诗词不仅具有很高的文学价值，也是研究宋代海南社会生活的重要资料。'
                }
            }
        ]
    },
    
    init() {
        this.float = document.getElementById('assistant-float');
        this.header = document.getElementById('assistant-header');
        this.input = document.getElementById('assistant-input');
        this.searchBtn = document.getElementById('assistant-search-btn');
        this.closeBtn = document.getElementById('assistant-close');
        this.minBtn = document.getElementById('assistant-min');
        this.toggleBtn = document.getElementById('assistant-toggle');
        this.chatContainer = document.getElementById('assistant-chat');
        this.messagesContainer = document.getElementById('chat-messages');
        this.loading = document.getElementById('chat-loading');
        this.quickQuestions = document.getElementById('quick-questions');

        if (!this.float) return;

        this.loadSavedPosition();
        this.loadConversationHistory();
        this.bindEvents();
        this.renderWelcomeMessage();
    },
    
    bindEvents() {
        // 鼠标拖拽事件
        this.header.addEventListener('mousedown', (e) => this.startDrag(e));

        // 触摸拖拽事件（移动端支持）
        this.header.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

        this.closeBtn.addEventListener('click', () => this.hide());
        this.minBtn.addEventListener('click', () => this.minimize());
        this.toggleBtn.addEventListener('click', (e) => {
            // 检查是否刚刚完成了拖拽操作
            // 如果是拖拽，则忽略此次点击，不显示浮窗
            if (typeof AssistantToggleDrag !== 'undefined' && AssistantToggleDrag.justDragged()) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            // 正常的点击操作，切换浮窗显示状态
            this.toggle();
        });

        // 清空对话按钮
        const clearBtn = document.getElementById('assistant-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearConversation());
        }

        this.searchBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 快捷问题按钮
        if (this.quickQuestions) {
            this.quickQuestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('quick-btn')) {
                    const question = e.target.dataset.question;
                    this.input.value = question;
                    this.sendMessage();
                }
            });
        }

        // 鼠标移动和释放
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());

        // 触摸移动和释放
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('touchend', () => this.stopDrag());
        document.addEventListener('touchcancel', () => this.stopDrag());

        // 窗口大小改变时重新调整位置
        window.addEventListener('resize', utils.throttle(() => this.adjustPositionOnResize(), 200));
    },
    
    clearConversation() {
        if (confirm('确定要清空当前对话吗？')) {
            this.conversationHistory = [];
            this.saveConversationHistory();
            this.messagesContainer.innerHTML = '';
            this.renderWelcomeMessage();
        }
    },
    
    startDrag(e) {
        // 防止点击按钮时触发拖拽
        if (e.target.closest('.assistant-btn')) return;

        e.preventDefault();
        this.isDragging = true;

        // 获取触摸或鼠标位置
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.floatStartX = this.float.offsetLeft;
        this.floatStartY = this.float.offsetTop;
        this.lastX = this.floatStartX;
        this.lastY = this.floatStartY;

        // 添加拖拽状态样式
        this.float.classList.add('dragging');
        this.float.style.transition = 'none';

        // 防止文本选择
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    },

    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        // 获取触摸或鼠标位置
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - this.dragStartX;
        const dy = clientY - this.dragStartY;

        let newX = this.floatStartX + dx;
        let newY = this.floatStartY + dy;

        // 边界检测 - 限制在可视窗口内
        const margin = 10; // 留出边距
        const maxX = window.innerWidth - this.float.offsetWidth - margin;
        const maxY = window.innerHeight - this.float.offsetHeight - margin;

        newX = Math.max(margin, Math.min(newX, maxX));
        newY = Math.max(margin, Math.min(newY, maxY));

        // 应用新位置
        this.float.style.left = newX + 'px';
        this.float.style.top = newY + 'px';
        this.float.style.right = 'auto'; // 清除 right 属性

        // 保存当前位置（用于动画）
        this.lastX = newX;
        this.lastY = newY;
    },

    stopDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;

        // 移除拖拽状态样式
        this.float.classList.remove('dragging');
        this.float.style.transition = '';

        // 恢复文本选择
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';

        // 保存位置到本地存储
        this.savePosition();

        // 添加轻微的弹跳效果
        this.float.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.float.style.transform = 'scale(1)';
        }, 150);
    },

    savePosition() {
        const position = {
            x: this.float.offsetLeft,
            y: this.float.offsetTop,
            timestamp: Date.now()
        };
        utils.storage.set('assistantPosition', position);
    },

    loadSavedPosition() {
        const savedPosition = utils.storage.get('assistantPosition', null);

        if (savedPosition && this.float) {
            // 检查保存的位置是否仍然有效（在24小时内）
            const isRecent = (Date.now() - savedPosition.timestamp) < 24 * 60 * 60 * 1000;

            if (isRecent) {
                // 确保位置在有效范围内
                const margin = 10;
                const maxX = window.innerWidth - this.float.offsetWidth - margin;
                const maxY = window.innerHeight - this.float.offsetHeight - margin;

                const x = Math.max(margin, Math.min(savedPosition.x, maxX));
                const y = Math.max(margin, Math.min(savedPosition.y, maxY));

                this.float.style.left = x + 'px';
                this.float.style.top = y + 'px';
                this.float.style.right = 'auto';
            }
        }
    },

    adjustPositionOnResize() {
        if (!this.float) return;

        // 调整位置确保浮窗仍在可视区域内
        const currentX = this.float.offsetLeft;
        const currentY = this.float.offsetTop;

        const margin = 10;
        const maxX = window.innerWidth - this.float.offsetWidth - margin;
        const maxY = window.innerHeight - this.float.offsetHeight - margin;

        const newX = Math.max(margin, Math.min(currentX, maxX));
        const newY = Math.max(margin, Math.min(currentY, maxY));

        if (newX !== currentX || newY !== currentY) {
            this.float.style.left = newX + 'px';
            this.float.style.top = newY + 'px';
            this.savePosition();
        }
    },
    
    renderWelcomeMessage() {
        if (this.conversationHistory.length === 0) {
            this.addMessage('ai', '您好！我是崖城智查，崖州古城的AI文化向导。\n\n我可以为您介绍：\n• 崖州古城的历史沿革\n• 古城建筑与四门布局\n• 贬官文化与历史人物\n• 相关历史文献资料\n\n请问有什么想了解的吗？');
        } else {
            this.conversationHistory.forEach(msg => {
                this.addMessage(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
            });
        }
    },
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isTyping) return;
        
        // 添加用户消息
        this.addMessage('user', message);
        this.input.value = '';
        
        // 添加到历史记录
        this.conversationHistory.push({ role: 'user', content: message });
        this.trimHistory();
        
        // 显示加载状态
        this.showLoading();
        this.isTyping = true;
        
        try {
            // 调用AI API
            const response = await this.callAI(message);
            this.hideLoading();
            
            // 添加AI回复
            this.addMessage('ai', response);
            this.conversationHistory.push({ role: 'assistant', content: response });
            this.trimHistory();
            this.saveConversationHistory();
        } catch (error) {
            this.hideLoading();
            // 使用本地知识库作为备用
            const localResponse = this.searchLocalKnowledge(message);
            this.addMessage('ai', localResponse);
        } finally {
            this.isTyping = false;
        }
    },
    
    async callAI(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                history: this.conversationHistory.slice(-5) // 只保留最近5轮对话
            })
        });
        
        if (!response.ok) {
            throw new Error('API请求失败');
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.reply;
    },
    
    searchLocalKnowledge(keyword) {
        const allData = [
            ...this.knowledgeBase.history,
            ...this.knowledgeBase.officials,
            ...this.knowledgeBase.architecture,
            ...this.knowledgeBase.literature
        ];
        
        const lowerKeyword = keyword.toLowerCase();
        const matches = allData.filter(item => 
            item.title.toLowerCase().includes(lowerKeyword) ||
            item.summary.toLowerCase().includes(lowerKeyword)
        );
        
        if (matches.length > 0) {
            const item = matches[0];
            let response = `【${item.title}】\n\n${item.summary}\n\n`;
            
            if (item.detail.description) {
                response += item.detail.description;
            }
            
            return response;
        }
        
        return '抱歉，我暂时无法回答这个问题。您可以尝试询问关于崖州古城的历史、建筑、人物或文献等方面的问题。';
    },
    
    addMessage(role, content, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        
        const avatar = role === 'user' ? '👤' : '<img src="../images/content/agent1.png" alt="智能助手" class="avatar-img">';
        const name = role === 'user' ? '您' : '崖城智查';
        
        // 将换行符转换为HTML
        const formattedContent = content.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">${name}</div>
                <div class="message-body">${formattedContent}</div>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        
        if (animate) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(10px)';
            setTimeout(() => {
                messageDiv.style.transition = 'all 0.3s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 10);
        }
        
        this.scrollToBottom();
    },
    
    showLoading() {
        this.loading.style.display = 'flex';
        this.scrollToBottom();
    },
    
    hideLoading() {
        this.loading.style.display = 'none';
    },
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },
    
    trimHistory() {
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    },
    
    saveConversationHistory() {
        utils.storage.set('assistantHistory', this.conversationHistory);
    },
    
    loadConversationHistory() {
        this.conversationHistory = utils.storage.get('assistantHistory', []);
    },
    
    hide() {
        this.float.style.display = 'none';
        this.toggleBtn.style.display = 'flex';
    },
    
    show() {
        this.float.style.display = 'flex';
        this.toggleBtn.style.display = 'none';
        this.input.focus();
    },
    
    minimize() {
        this.hide();
    },
    
    toggle() {
        if (this.float.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    },
    
    // 兼容旧版接口
    search() {
        this.sendMessage();
    }
};

// ===== 智能助手图标拖拽功能 =====
const AssistantToggleDrag = {
    toggleBtn: null,
    isDragging: false,
    wasDragged: false,  // 标记是否发生了实际的拖拽操作
    dragStartX: 0,
    dragStartY: 0,
    btnStartX: 0,
    btnStartY: 0,
    dragThreshold: 5,  // 拖拽判定阈值（像素）

    init() {
        this.toggleBtn = document.getElementById('assistant-toggle');
        if (!this.toggleBtn) return;

        // 添加可拖拽样式类
        this.toggleBtn.classList.add('draggable');

        // 清除旧的位置数据（因为HTML结构已改变）
        utils.storage.remove('assistantTogglePosition');

        // 绑定事件
        this.bindEvents();
    },

    bindEvents() {
        // 鼠标事件
        this.toggleBtn.addEventListener('mousedown', (e) => this.startDrag(e));

        // 触摸事件（移动端支持）
        this.toggleBtn.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

        // 全局移动和释放事件
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());

        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('touchend', () => this.stopDrag());
        document.addEventListener('touchcancel', () => this.stopDrag());

        // 窗口大小改变时调整位置
        window.addEventListener('resize', utils.throttle(() => this.adjustPositionOnResize(), 200));
    },

    startDrag(e) {
        // 只响应左键或触摸
        if (e.type === 'mousedown' && e.button !== 0) return;

        e.preventDefault();
        this.isDragging = true;
        this.wasDragged = false;  // 重置拖拽标记

        // 获取触摸或鼠标位置
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // 获取按钮当前位置
        const rect = this.toggleBtn.getBoundingClientRect();

        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.btnStartX = rect.left;
        this.btnStartY = rect.top;

        // 添加拖拽状态样式
        this.toggleBtn.classList.add('dragging');

        // 切换为绝对定位以便自由移动
        this.toggleBtn.style.position = 'fixed';
        this.toggleBtn.style.left = this.btnStartX + 'px';
        this.toggleBtn.style.top = this.btnStartY + 'px';
        this.toggleBtn.style.right = 'auto';
        this.toggleBtn.style.bottom = 'auto';

        // 防止文本选择
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    },

    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        // 获取触摸或鼠标位置
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - this.dragStartX;
        const dy = clientY - this.dragStartY;

        // 检查是否超过拖拽阈值
        if (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold) {
            this.wasDragged = true;  // 标记为已拖拽
        }

        let newX = this.btnStartX + dx;
        let newY = this.btnStartY + dy;

        // 边界检测 - 限制在可视窗口内
        const margin = 10;
        const btnWidth = this.toggleBtn.offsetWidth || 56;
        const btnHeight = this.toggleBtn.offsetHeight || 56;
        const maxX = window.innerWidth - btnWidth - margin;
        const maxY = window.innerHeight - btnHeight - margin;

        newX = Math.max(margin, Math.min(newX, maxX));
        newY = Math.max(margin, Math.min(newY, maxY));

        // 应用新位置
        this.toggleBtn.style.left = newX + 'px';
        this.toggleBtn.style.top = newY + 'px';
    },

    stopDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;

        // 移除拖拽状态样式
        this.toggleBtn.classList.remove('dragging');

        // 恢复文本选择
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';

        // 保存位置到本地存储
        this.savePosition();

        // 延迟重置 wasDragged 标志，以便 click 事件可以检查
        setTimeout(() => {
            this.wasDragged = false;
        }, 100);
    },

    // 检查是否刚刚完成拖拽（用于过滤 click 事件）
    justDragged() {
        return this.wasDragged;
    },

    savePosition() {
        const position = {
            x: parseInt(this.toggleBtn.style.left),
            y: parseInt(this.toggleBtn.style.top),
            timestamp: Date.now()
        };
        utils.storage.set('assistantTogglePosition', position);
    },

    loadSavedPosition() {
        const savedPosition = utils.storage.get('assistantTogglePosition', null);

        if (savedPosition && this.toggleBtn) {
            // 检查保存的位置是否仍然有效（在24小时内）
            const isRecent = (Date.now() - savedPosition.timestamp) < 24 * 60 * 60 * 1000;

            if (isRecent) {
                // 确保位置在有效范围内
                const margin = 10;
                const btnWidth = this.toggleBtn.offsetWidth || 56;
                const btnHeight = this.toggleBtn.offsetHeight || 56;
                const maxX = window.innerWidth - btnWidth - margin;
                const maxY = window.innerHeight - btnHeight - margin;

                const x = Math.max(margin, Math.min(savedPosition.x, maxX));
                const y = Math.max(margin, Math.min(savedPosition.y, maxY));

                // 应用保存的位置
                this.toggleBtn.style.position = 'fixed';
                this.toggleBtn.style.left = x + 'px';
                this.toggleBtn.style.top = y + 'px';
                this.toggleBtn.style.right = 'auto';
                this.toggleBtn.style.bottom = 'auto';
            }
        }
    },

    adjustPositionOnResize() {
        if (!this.toggleBtn || !this.toggleBtn.style.left) return;

        // 调整位置确保按钮仍在可视区域内
        const currentX = parseInt(this.toggleBtn.style.left);
        const currentY = parseInt(this.toggleBtn.style.top);

        const margin = 10;
        const btnWidth = this.toggleBtn.offsetWidth || 56;
        const btnHeight = this.toggleBtn.offsetHeight || 56;
        const maxX = window.innerWidth - btnWidth - margin;
        const maxY = window.innerHeight - btnHeight - margin;

        const newX = Math.max(margin, Math.min(currentX, maxX));
        const newY = Math.max(margin, Math.min(currentY, maxY));

        if (newX !== currentX || newY !== currentY) {
            this.toggleBtn.style.left = newX + 'px';
            this.toggleBtn.style.top = newY + 'px';
            this.savePosition();
        }
    }
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    Navbar.init();
    PageProgress.init();
    GlobalControls.init();
    Modal.init();
    GuideOverlay.init();
    ScrollReveal.init();
    Assistant.init();
    AssistantToggleDrag.init();

    console.log('%c崖城风骨——崖州古城建筑文化数字图鉴', 'color: #8B4513; font-size: 18px; font-weight: bold;');
    console.log('%c全国大学生计算机设计大赛参赛作品', 'color: #2F5D7A; font-size: 14px;');
});

// ===== 页面卸载清理 =====
window.addEventListener('beforeunload', () => {
    GlobalControls.saveAudioState();
    GlobalControls.stopProgressTracking();
});
