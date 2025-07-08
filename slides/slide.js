// スライドページ用のJavaScript - GitHub Pages対応
class SlideController {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.slidesContainer = document.querySelector('.slides');
    this.indicators = document.querySelectorAll('.indicator');
    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    
    // エラーハンドリング
    if (!this.slidesContainer || this.totalSlides === 0) {
      console.error('スライドコンテナまたはスライドが見つかりません');
      return;
    }
    
    this.init();
  }
  
  init() {
    this.setupNavigation();
    this.setupKeyboardNavigation();
    this.setupIndicators();
    this.updateSlideDisplay();
  }
  
  setupNavigation() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previousSlide());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // フォーカスが入力フィールドにある場合は無視
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          this.previousSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSlide(this.totalSlides - 1);
          break;
      }
    });
  }
  
  setupIndicators() {
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
  }
  
  previousSlide() {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }
  
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  }
  
  goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < this.totalSlides) {
      this.currentSlide = slideIndex;
      this.updateSlideDisplay();
    }
  }
  
  updateSlideDisplay() {
    // スライドの位置を更新
    const translateX = -this.currentSlide * 100;
    if (this.slidesContainer) {
      this.slidesContainer.style.transform = `translateX(${translateX}%)`;
    }
    
    // インジケーターの更新
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
    
    // ナビゲーションボタンの状態を更新
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentSlide === 0;
    }
    
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }
    
    // スライド番号の更新
    const slideNumbers = document.querySelectorAll('.slide-number');
    slideNumbers.forEach((number, index) => {
      if (index === this.currentSlide) {
        number.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
      }
    });
  }
}

// タッチイベントのサポート
class TouchController {
  constructor(slideController) {
    this.slideController = slideController;
    this.startX = 0;
    this.endX = 0;
    this.threshold = 50; // スワイプの最小距離
    
    this.init();
  }
  
  init() {
    const slidesContainer = document.querySelector('.slides-container');
    
    if (!slidesContainer) {
      console.warn('スライドコンテナが見つかりません');
      return;
    }
    
    slidesContainer.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
    }, { passive: true });
    
    slidesContainer.addEventListener('touchend', (e) => {
      this.endX = e.changedTouches[0].clientX;
      this.handleSwipe();
    }, { passive: true });
  }
  
  handleSwipe() {
    const deltaX = this.endX - this.startX;
    
    if (Math.abs(deltaX) > this.threshold) {
      if (deltaX > 0) {
        // 右にスワイプ - 前のスライドへ
        this.slideController.previousSlide();
      } else {
        // 左にスワイプ - 次のスライドへ
        this.slideController.nextSlide();
      }
    }
  }
}

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    const slideController = new SlideController();
    
    // スライドコントローラーが正常に初期化された場合のみタッチコントローラーを初期化
    if (slideController.totalSlides > 0) {
      new TouchController(slideController);
      
      // URLハッシュによるスライド指定のサポート
      const hash = window.location.hash;
      if (hash) {
        const slideNumber = parseInt(hash.substring(1));
        if (!isNaN(slideNumber) && slideNumber > 0 && slideNumber <= slideController.totalSlides) {
          slideController.goToSlide(slideNumber - 1);
        }
      }
      
      // スライド変更時にURLハッシュを更新
      const originalGoToSlide = slideController.goToSlide;
      slideController.goToSlide = function(slideIndex) {
        originalGoToSlide.call(this, slideIndex);
        
        // URLハッシュの更新（エラーハンドリング付き）
        try {
          window.location.hash = `#${slideIndex + 1}`;
        } catch (e) {
          console.warn('URLハッシュの更新に失敗しました:', e);
        }
      };
    }
  } catch (error) {
    console.error('スライドシステムの初期化に失敗しました:', error);
  }
});

// フルスクリーンモードのサポート
function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  } catch (error) {
    console.warn('フルスクリーンモードの切り替えに失敗しました:', error);
  }
}

// プレゼンテーションモードのキーボードショートカット
document.addEventListener('keydown', (e) => {
  if (e.key === 'F11') {
    e.preventDefault();
    toggleFullscreen();
  }
});

// エラーハンドリング
window.addEventListener('error', (e) => {
  console.error('JavaScriptエラーが発生しました:', e.error);
});

// 未処理のPromise拒否のハンドリング
window.addEventListener('unhandledrejection', (e) => {
  console.error('未処理のPromise拒否:', e.reason);
}); 