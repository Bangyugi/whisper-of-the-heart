/**
 * CHIBI COUPLE & FOREGROUND STAGE ARTWORK (LAYER 3: z-30)
 * Vẽ cặp đôi Chibi Nam & Nữ nét tròn viền nâu (#522D24) khớp với 6 trạng thái trong kịch bản:
 * 1. 'shy-confess'   : Màn hình 1 (Nam giấu hoa sau lưng hồi hộp, Nữ hai tay áp má bất ngờ)
 * 2. 'gaze-stars'    : Đồng ý GĐ1 (Hai nhân vật ngước nhìn bầu trời sao chạng vạng)
 * 3. 'happy-laugh'   : Đồng ý GĐ2-4 (Quay sang nhau cười tít mắt hạnh phúc, tim hồng bay)
 * 4. 'calm-look'     : Từ chối GĐ1-2 (Đứng nhìn nhau bình yên dưới ánh chiều tà)
 * 5. 'back-sunset'   : Từ chối GĐ3 (Quay lưng ngắm bầu trời hoàng hôn & máy bay giấy)
 * 6. 'friends-smile' : Từ chối GĐ4 (Đứng chính diện mỉm cười nhẹ nhàng như hai người bạn tốt)
 */

window.ChibiStage = {
  currentPose: null,
  _initialized: false,
  _poseLayers: {},

  ensureInitialized(container) {
    if (this._initialized && container.querySelector('.chibi-pose-layer')) return;

    const allPoses = [
      'shy-confess',
      'gaze-stars',
      'happy-laugh',
      'calm-look',
      'back-sunset',
      'friends-smile'
    ];

    const sharedDefsSvg = `<svg width="0" height="0" class="
      absolute pointer-events-none opacity-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${this.sharedDefsMarkup()}</svg>`;

    const layersHtml = allPoses
      .map(
        (pose) =>
          `<div class="chibi-pose-layer absolute inset-0 w-full h-full pointer-events-none" data-pose-layer="${pose}" style="opacity: 0; visibility: hidden;">${this.getPoseSVG(pose)}</div>`
      )
      .join('');

    container.innerHTML = sharedDefsSvg + layersHtml;
    this._poseLayers = {};
    allPoses.forEach((pose) => {
      this._poseLayers[pose] = container.querySelector(`[data-pose-layer="${pose}"]`);
    });
    this._initialized = true;
  },

  renderPose(poseName, immediate = false) {
    const container = document.getElementById('chibi-couple-root');
    if (!container) return;

    const isFirstRender = !this._initialized;
    this.ensureInitialized(container);

    // Nếu pose không đổi trong quá trình chạy bình thường (VD: GĐ 2 -> GĐ 3 -> GĐ 4 đều là 'happy-laugh'), giữ nguyên hoàn toàn
    if (!isFirstRender && this.currentPose === poseName && !immediate) {
      return;
    }

    this.currentPose = poseName;
    container.setAttribute('data-pose', poseName);

    const shouldSetInstant = immediate || isFirstRender || typeof gsap === 'undefined';

    Object.entries(this._poseLayers).forEach(([pose, layerEl]) => {
      if (!layerEl) return;
      const isActive = pose === poseName;
      const targetOpacity = isActive ? 1 : 0;
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(layerEl);
      }
      if (shouldSetInstant) {
        layerEl.style.opacity = String(targetOpacity);
        layerEl.style.visibility = isActive ? 'visible' : 'hidden';
      } else if (isActive) {
        layerEl.style.visibility = 'visible';
        gsap.to(layerEl, {
          opacity: 1,
          duration: 0.5,
          ease: 'sine.inOut'
        });
      } else if (parseFloat(layerEl.style.opacity || '0') > 0) {
        gsap.to(layerEl, {
          opacity: 0,
          duration: 0.5,
          ease: 'sine.inOut',
          onComplete: () => {
            layerEl.style.visibility = 'hidden';
          }
        });
      } else {
        layerEl.style.visibility = 'hidden';
      }
    });
  },

  getPoseSVG(pose) {
    switch (pose) {
      case 'gaze-stars':
        return this.svgGazeStars();
      case 'happy-laugh':
        return this.svgHappyLaugh();
      case 'calm-look':
        return this.svgCalmLook();
      case 'back-sunset':
        return this.svgBackSunset();
      case 'friends-smile':
        return this.svgFriendsSmile();
      case 'shy-confess':
      default:
        return this.svgShyConfess();
    }
  },

  // Shared SVG Defs mounted once for all poses
  sharedDefsMarkup() {
    return `
      <defs>
        <filter id="chibi-shadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#3E1F18" flood-opacity="0.18"/>
        </filter>
        <linearGradient id="boy-hair-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5B3D36"/>
          <stop offset="100%" stop-color="#412924"/>
        </linearGradient>
        <linearGradient id="girl-hair-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7B5142"/>
          <stop offset="100%" stop-color="#5B392E"/>
        </linearGradient>
        <linearGradient id="skin-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFE8DA"/>
          <stop offset="100%" stop-color="#FAD4C0"/>
        </linearGradient>
      </defs>
    `;
  },

  commonDefs() {
    return '';
  },

  // 1. MÀN HÌNH 1: Nam giấu hoa sau lưng hồi hộp, Nữ hai tay áp má bất ngờ (begining.png)
  svgShyConfess() {
    return `
    <svg viewBox="0 0 320 210" class="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${this.commonDefs()}
      <!-- Bóng đổ dưới chân trên đồi cỏ -->
      <ellipse cx="116" cy="192" rx="34" ry="8" fill="#4A5828" opacity="0.38"/>
      <ellipse cx="204" cy="192" rx="34" ry="8" fill="#4A5828" opacity="0.38"/>

      <!-- Hoa nhỏ dưới chân giữa 2 người -->
      <g transform="translate(139, 175) scale(0.78)">
        <circle cx="0" cy="-7" r="5" fill="#FFB2C0" stroke="#522D24" stroke-width="2.2"/>
        <circle cx="7" cy="-2" r="5" fill="#FFB2C0" stroke="#522D24" stroke-width="2.2"/>
        <circle cx="4" cy="6" r="5" fill="#FFB2C0" stroke="#522D24" stroke-width="2.2"/>
        <circle cx="-4" cy="6" r="5" fill="#FFB2C0" stroke="#522D24" stroke-width="2.2"/>
        <circle cx="-7" cy="-2" r="5" fill="#FFB2C0" stroke="#522D24" stroke-width="2.2"/>
        <circle cx="0" cy="0" r="3.2" fill="#FFE082" stroke="#522D24" stroke-width="2"/>
      </g>

      <!-- ================= BẠN NAM (TRÁI) ================= -->
      <g class="chibi-boy-group">
        <!-- Bông hoa đỏ giấu sau lưng (nhô ra bên trái) -->
        <g class="flower-sway" transform="translate(82, 138)">
          <path d="M18 14 Q4 16 -4 6" stroke="#4D7831" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M5 12 Q-1 18 -7 14 Q-3 8 5 12 Z" fill="#689F38" stroke="#522D24" stroke-width="2"/>
          <g transform="translate(-8, 1)">
            <circle cx="0" cy="-7" r="5.5" fill="#FF7976" stroke="#522D24" stroke-width="2.3"/>
            <circle cx="7" cy="-2" r="5.5" fill="#FF7976" stroke="#522D24" stroke-width="2.3"/>
            <circle cx="4.5" cy="6" r="5.5" fill="#FF7976" stroke="#522D24" stroke-width="2.3"/>
            <circle cx="-4.5" cy="6" r="5.5" fill="#FF7976" stroke="#522D24" stroke-width="2.3"/>
            <circle cx="-7" cy="-2" r="5.5" fill="#FF7976" stroke="#522D24" stroke-width="2.3"/>
            <circle cx="0" cy="0" r="3.6" fill="#FFDF78" stroke="#522D24" stroke-width="2.2"/>
          </g>
        </g>

        <!-- Chân & Giày Nam -->
        <path d="M104 156 L104 186 Q104 191 112 191 L115 191 L115 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M119 156 L119 186 Q119 191 127 191 L130 191 L130 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <ellipse cx="109" cy="189" rx="9" ry="4.5" fill="#5D3B30" stroke="#522D24" stroke-width="2.6"/>
        <ellipse cx="126" cy="189" rx="9" ry="4.5" fill="#5D3B30" stroke="#522D24" stroke-width="2.6"/>

        <!-- Thân áo sơ mi xanh nhạt -->
        <path d="M101 118 Q96 138 99 160 L134 160 Q137 138 131 118 Z" fill="#DCEFF9" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <!-- Cổ áo sơ mi & đường cúc -->
        <path d="M110 118 L117 127 L124 118" fill="#FFFFFF" stroke="#522D24" stroke-width="2.4" stroke-linejoin="round"/>
        <line x1="120" y1="127" x2="120" y2="159" stroke="#522D24" stroke-width="2.2"/>

        <!-- Tay trái vòng ra sau lưng cầm hoa -->
        <path d="M105 123 Q92 135 96 149 Q102 152 108 145" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7" stroke-linecap="round"/>
        <path d="M106 120 Q95 130 96 141 L107 142 Q109 131 108 122 Z" fill="#DCEFF9" stroke="#522D24" stroke-width="2.7" stroke-linejoin="round"/>

        <!-- Đầu & Khuôn mặt Nam (hơi nghiêng nhìn sang phải) -->
        <g class="chibi-head-boy">
          <!-- Tai trái -->
          <circle cx="83" cy="92" r="8.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.8"/>
          <path d="M81 90 Q84 92 82 95" stroke="#C98A74" stroke-width="2" stroke-linecap="round"/>

          <!-- Khuôn mặt tròn bầu bĩnh -->
          <path d="M85 64 C83 96 90 117 118 117 C144 117 150 96 147 64 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>

          <!-- Má hồng bẽn lẽn -->
          <ellipse cx="99" cy="99" rx="7.5" ry="4.2" fill="#FF9494" opacity="0.65"/>
          <ellipse cx="137" cy="98" rx="6.5" ry="3.8" fill="#FF9494" opacity="0.65"/>

          <!-- Đôi mắt to nhìn sang bạn nữ + Lông mày hồi hộp -->
          <path d="M97 79 Q104 75 110 78" stroke="#522D24" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M128 77 Q134 75 140 79" stroke="#522D24" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Mắt trái -->
          <ellipse cx="105" cy="90" rx="5.5" ry="6.5" fill="#43261E"/>
          <circle cx="103.5" cy="87.5" r="2.3" fill="#FFFFFF"/>
          <circle cx="107" cy="92.5" r="1.1" fill="#FFFFFF"/>
          <!-- Mắt phải -->
          <ellipse cx="133" cy="89.5" rx="5.2" ry="6.2" fill="#43261E"/>
          <circle cx="131.5" cy="87" r="2.2" fill="#FFFFFF"/>
          <circle cx="135" cy="92" r="1.1" fill="#FFFFFF"/>

          <!-- Miệng nhỏ bối rối dễ thương -->
          <path d="M117 103 Q120 101.5 123 103" stroke="#522D24" stroke-width="2.4" stroke-linecap="round"/>

          <!-- Mái tóc nâu bồng bềnh đặc trưng -->
          <path d="M80 84 C74 62 88 38 116 38 C144 38 157 58 151 80 C148 68 142 63 136 72 C131 62 122 65 117 75 C111 64 101 66 95 76 C90 68 84 73 80 84 Z" fill="url(#boy-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
          <!-- Chỏm tóc đỉnh đầu -->
          <path d="M106 39 Q98 31 90 36 Q96 42 101 43" fill="#5B3D36" stroke="#522D24" stroke-width="2.6" stroke-linejoin="round"/>
          <path d="M138 45 Q148 41 153 47 Q146 52 141 51" fill="#5B3D36" stroke="#522D24" stroke-width="2.6" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- ================= BẠN NỮ (PHẢI) ================= -->
      <g class="chibi-girl-group">
        <!-- Mái tóc dài phía sau lưng -->
        <path d="M168 82 C161 108 159 136 167 148 C176 154 228 154 237 146 C245 134 242 106 234 82 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>

        <!-- Chân, Tất trắng & Giày Nữ -->
        <path d="M190 162 L188 186 L197 186 L198 162 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.6"/>
        <path d="M206 162 L208 186 L217 186 L214 162 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.6"/>
        <rect x="188" y="176" width="9" height="9" rx="2" fill="#FFFFFF" stroke="#522D24" stroke-width="2.2"/>
        <rect x="207" y="176" width="9" height="9" rx="2" fill="#FFFFFF" stroke="#522D24" stroke-width="2.2"/>
        <ellipse cx="192" cy="189" rx="8.5" ry="4.2" fill="#6D4335" stroke="#522D24" stroke-width="2.6"/>
        <ellipse cx="213" cy="189" rx="8.5" ry="4.2" fill="#6D4335" stroke="#522D24" stroke-width="2.6"/>

        <!-- Chân váy xếp ly xanh đen -->
        <path d="M181 148 L175 166 L227 166 L221 148 Z" fill="#3E4656" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <line x1="188" y1="149" x2="185" y2="165" stroke="#522D24" stroke-width="2.2"/>
        <line x1="201" y1="149" x2="201" y2="165" stroke="#522D24" stroke-width="2.2"/>
        <line x1="214" y1="149" x2="217" y2="165" stroke="#522D24" stroke-width="2.2"/>

        <!-- Áo kem cổ thủy thủ + Nơ đỏ -->
        <path d="M182 121 L179 150 L223 150 L220 121 Z" fill="#FFF3D1" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M186 121 L201 134 L216 121" fill="none" stroke="#522D24" stroke-width="2.5"/>
        <!-- Nơ đỏ trước ngực -->
        <path d="M201 133 L192 128 L194 139 Z" fill="#E35A54" stroke="#522D24" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M201 133 L210 128 L208 139 Z" fill="#E35A54" stroke="#522D24" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M199 134 L196 146 M203 134 L206 146" stroke="#E35A54" stroke-width="3" stroke-linecap="round"/>
        <circle cx="201" cy="133" r="3" fill="#FF7B74" stroke="#522D24" stroke-width="2"/>

        <!-- Đầu & Khuôn mặt Nữ (Bất ngờ ửng hồng) -->
        <g class="chibi-head-girl">
          <!-- Tai phải -->
          <circle cx="231" cy="99" r="7.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
          <!-- Khuôn mặt -->
          <path d="M172 72 C170 101 177 121 201 121 C225 121 231 101 229 72 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>

          <!-- Má hồng ửng đỏ -->
          <ellipse cx="182" cy="104" rx="7.5" ry="4.5" fill="#FF8A8A" opacity="0.75"/>
          <ellipse cx="216" cy="104" rx="7.5" ry="4.5" fill="#FF8A8A" opacity="0.75"/>

          <!-- Lông mày & Đôi mắt to tròn long lanh bất ngờ -->
          <path d="M178 82 Q184 78 190 81" stroke="#522D24" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M207 81 Q213 78 219 82" stroke="#522D24" stroke-width="2.4" stroke-linecap="round"/>
          <ellipse cx="184" cy="94" rx="5.8" ry="6.8" fill="#4A2A20"/>
          <circle cx="182.2" cy="91.2" r="2.5" fill="#FFFFFF"/>
          <circle cx="186.2" cy="96.5" r="1.2" fill="#FFFFFF"/>

          <ellipse cx="212" cy="94" rx="5.8" ry="6.8" fill="#4A2A20"/>
          <circle cx="210.2" cy="91.2" r="2.5" fill="#FFFFFF"/>
          <circle cx="214.2" cy="96.5" r="1.2" fill="#FFFFFF"/>

          <!-- Miệng chữ O nhỏ bất ngờ -->
          <ellipse cx="198" cy="106" rx="4.2" ry="3.2" fill="#FF8580" stroke="#522D24" stroke-width="2.3"/>

          <!-- Mái tóc trước trán & 2 lọn tóc mai -->
          <path d="M168 92 C164 66 178 48 202 48 C226 48 238 66 234 92 C230 78 225 72 219 82 C214 70 205 68 199 81 C192 69 183 72 178 83 C174 76 170 81 168 92 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>

          <!-- Hai bàn tay nhỏ áp lên má bất ngờ (Đúng chuẩn begining.png!) -->
          <path d="M179 136 Q172 122 184 113 L192 118 Q188 132 185 138 Z" fill="#FFF3D1" stroke="#522D24" stroke-width="2.6" stroke-linejoin="round"/>
          <circle cx="188" cy="113" r="5.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>

          <path d="M221 136 Q228 122 214 113 L206 118 Q210 132 215 138 Z" fill="#FFF3D1" stroke="#522D24" stroke-width="2.6" stroke-linejoin="round"/>
          <circle cx="209" cy="113" r="5.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        </g>
      </g>
    </svg>`;
  },

  // 2. ĐỒNG Ý GĐ 1 (00s-12s): Hai nhân vật đứng dưới đồi ngước nhìn bầu trời sao (accept.png GĐ 1)
  svgGazeStars() {
    return `
    <svg viewBox="0 0 320 210" class="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${this.commonDefs()}
      <ellipse cx="114" cy="192" rx="32" ry="7.5" fill="#2A2421" opacity="0.42"/>
      <ellipse cx="206" cy="192" rx="32" ry="7.5" fill="#2A2421" opacity="0.42"/>

      <!-- BẠN NAM NGƯỚC NHÌN BẦU TRỜI SAO -->
      <g class="chibi-boy-group">
        <path d="M104 156 L104 187 L114 187 L114 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <path d="M117 156 L117 187 L127 187 L127 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <ellipse cx="109" cy="189" rx="8" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="123" cy="189" rx="8" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>

        <path d="M101 120 Q97 140 100 160 L131 160 Q134 140 129 120 Z" fill="#7085A6" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M104 124 Q96 138 101 151" stroke="#522D24" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M126 124 Q134 138 129 151" stroke="#522D24" stroke-width="2.8" stroke-linecap="round"/>

        <!-- Đầu ngước lên (rotate -12deg) -->
        <g transform="rotate(-12 115 92)">
          <circle cx="86" cy="94" r="8" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
          <path d="M88 66 C86 96 93 116 119 116 C143 116 149 96 146 66 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
          <ellipse cx="104" cy="96" rx="6.5" ry="3.8" fill="#FF9494" opacity="0.65"/>
          <ellipse cx="137" cy="95" rx="6" ry="3.6" fill="#FF9494" opacity="0.65"/>
          <!-- Mắt ngước lên nhìn sao -->
          <ellipse cx="111" cy="85" rx="5.2" ry="6.2" fill="#43261E"/>
          <circle cx="110" cy="82" r="2.3" fill="#FFFFFF"/>
          <ellipse cx="135" cy="85" rx="5" ry="6" fill="#43261E"/>
          <circle cx="134" cy="82" r="2.2" fill="#FFFFFF"/>
          <path d="M121 99 Q125 102 129 99" stroke="#522D24" stroke-width="2.3" stroke-linecap="round"/>
          <path d="M82 86 C76 62 90 40 116 40 C142 40 154 58 149 79 C145 68 139 64 134 72 C128 63 119 66 114 75 C108 65 98 67 93 77 Z" fill="url(#boy-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- BẠN NỮ VÁY HỒNG NGƯỚC NHÌN BẦU TRỜI SAO -->
      <g class="chibi-girl-group">
        <!-- Tóc dài phía sau lưng (vẽ trước thân váy) -->
        <path d="M176 80 C170 108 173 136 182 146 C192 152 226 152 234 142 C240 128 236 102 230 80 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.8"/>

        <path d="M196 160 L195 187 L203 187 L204 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <path d="M209 160 L210 187 L218 187 L217 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="198" cy="189" rx="7.5" ry="3.8" fill="#6D4335" stroke="#522D24" stroke-width="2.4"/>
        <ellipse cx="214" cy="189" rx="7.5" ry="3.8" fill="#6D4335" stroke="#522D24" stroke-width="2.4"/>

        <!-- Đầm hồng xòe nhẹ -->
        <path d="M191 122 L180 165 Q206 171 230 165 L219 122 Z" fill="#F8A3B2" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M189 126 Q180 138 183 148" stroke="#FAD4C0" stroke-width="5" stroke-linecap="round"/>
        <path d="M189 126 Q180 138 183 148" stroke="#522D24" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Đầu bạn nữ ngước nhìn bầu trời sao (rotate 11deg) -->
        <g transform="rotate(11 206 96)">
          <path d="M177 70 C175 98 182 117 205 117 C228 117 234 98 232 70 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
          <ellipse cx="185" cy="98" rx="6" ry="3.6" fill="#FF8A8A" opacity="0.7"/>
          <ellipse cx="216" cy="99" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.7"/>
          <ellipse cx="187" cy="87" rx="5" ry="6" fill="#4A2A20"/>
          <circle cx="185.5" cy="84" r="2.2" fill="#FFFFFF"/>
          <ellipse cx="211" cy="88" rx="5.2" ry="6.2" fill="#4A2A20"/>
          <circle cx="209.5" cy="85" r="2.3" fill="#FFFFFF"/>
          <path d="M195 101 Q199 104 203 101" stroke="#522D24" stroke-width="2.3" stroke-linecap="round"/>
          <path d="M174 88 C170 63 184 46 206 46 C228 46 240 64 236 88 C231 75 225 70 219 79 C214 68 205 67 199 78 C192 68 184 71 174 88 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>`;
  },

  // 3. ĐỒNG Ý GĐ 2-4 (12s-40s): Cặp đôi quay sang nhau cười tít mắt hạnh phúc (accept.png GĐ 2, 3, 4)
  svgHappyLaugh() {
    return `
    <svg viewBox="0 0 320 210" class="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${this.commonDefs()}
      <ellipse cx="114" cy="192" rx="33" ry="7.5" fill="#4A5828" opacity="0.38"/>
      <ellipse cx="206" cy="192" rx="33" ry="7.5" fill="#4A5828" opacity="0.38"/>

      <!-- Trái tim hồng bay lên giữa 2 người -->
      <g class="heart-float-center" transform="translate(160, 72)">
        <path d="M0 8 C-12 -1 -7 -12 0 -4 C7 -12 12 -1 0 8 Z" fill="#FF7E79" stroke="#522D24" stroke-width="2.3" stroke-linejoin="round"/>
      </g>
      <g class="heart-float-sub" transform="translate(148, 108) scale(0.72)">
        <path d="M0 8 C-12 -1 -7 -12 0 -4 C7 -12 12 -1 0 8 Z" fill="#FF9490" stroke="#522D24" stroke-width="2.3" stroke-linejoin="round"/>
      </g>

      <!-- BẠN NAM CƯỜI TÍT MẮT RẠNG RỠ -->
      <g class="chibi-boy-group">
        <path d="M104 156 L104 187 L114 187 L114 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <path d="M117 156 L117 187 L127 187 L127 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <ellipse cx="109" cy="189" rx="8.5" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="123" cy="189" rx="8.5" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>

        <path d="M100 119 Q96 140 99 160 L132 160 Q135 140 130 119 Z" fill="#7B90B2" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M102 124 Q94 139 100 152" stroke="#FAD4C0" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M102 124 Q94 139 100 152" stroke="#522D24" stroke-width="2.6" stroke-linecap="round"/>

        <g transform="rotate(-6 115 92)">
          <circle cx="84" cy="94" r="8" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
          <path d="M86 65 C84 96 92 116 118 116 C144 116 150 96 147 65 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
          <!-- Má hồng rạng rỡ -->
          <ellipse cx="103" cy="97" rx="7.5" ry="4.5" fill="#FF8585" opacity="0.75"/>
          <ellipse cx="139" cy="96" rx="7" ry="4.2" fill="#FF8585" opacity="0.75"/>
          <!-- Mắt cười tít ^ ^ -->
          <path d="M101 89 Q108 81 115 89" stroke="#522D24" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M129 88 Q136 80 142 88" stroke="#522D24" stroke-width="3" stroke-linecap="round" fill="none"/>
          <!-- Nụ cười lớn hạnh phúc -->
          <path d="M117 97 Q124 108 131 97 Z" fill="#FF807A" stroke="#522D24" stroke-width="2.4" stroke-linejoin="round"/>
          <!-- Tóc nam -->
          <path d="M80 85 C74 61 88 39 116 39 C143 39 156 57 150 79 C146 67 140 63 135 72 C129 62 120 65 115 74 C109 64 99 66 94 76 Z" fill="url(#boy-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- BẠN NỮ CƯỜI TÍT MẮT HẠNH PHÚC -->
      <g class="chibi-girl-group">
        <path d="M177 82 C170 110 172 138 182 148 C192 154 228 154 236 144 C243 130 239 104 233 82 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.8"/>

        <path d="M195 160 L194 187 L202 187 L203 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <path d="M209 160 L210 187 L218 187 L217 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="197" cy="189" rx="8" ry="4" fill="#6D4335" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="214" cy="189" rx="8" ry="4" fill="#6D4335" stroke="#522D24" stroke-width="2.5"/>

        <!-- Đầm hồng phấn -->
        <path d="M190 121 L178 165 Q205 171 231 165 L219 121 Z" fill="#FFA4B4" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <!-- Tay nữ đan nhẹ trước ngực vui vẻ -->
        <path d="M191 126 Q181 138 190 146" stroke="#FAD4C0" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M191 126 Q181 138 190 146" stroke="#522D24" stroke-width="2.5" stroke-linecap="round"/>

        <g transform="rotate(6 205 94)">
          <circle cx="232" cy="97" r="7.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
          <path d="M175 70 C173 99 180 118 204 118 C227 118 233 99 231 70 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
          <ellipse cx="182" cy="99" rx="7" ry="4.2" fill="#FF8585" opacity="0.78"/>
          <ellipse cx="215" cy="100" rx="7.5" ry="4.5" fill="#FF8585" opacity="0.78"/>
          <!-- Mắt cười tít ^ ^ -->
          <path d="M180 90 Q186 82 193 90" stroke="#522D24" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M206 90 Q213 82 220 90" stroke="#522D24" stroke-width="3" stroke-linecap="round" fill="none"/>
          <!-- Miệng cười tươi -->
          <path d="M192 99 Q199 109 206 99 Z" fill="#FF807A" stroke="#522D24" stroke-width="2.4" stroke-linejoin="round"/>
          <!-- Tóc nữ -->
          <path d="M172 89 C168 64 182 47 205 47 C228 47 239 65 235 89 C230 76 224 70 218 80 C213 69 204 68 198 79 C191 69 182 72 172 89 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>`;
  },

  // 4. TỪ CHỐI GĐ 1-2 (00s-08s): Hai nhân vật đứng nhìn nhau bình yên dưới ánh chiều tà (reject.png GĐ 1-2)
  svgCalmLook() {
    return `
    <svg viewBox="0 0 320 210" class="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${this.commonDefs()}
      <ellipse cx="86" cy="192" rx="30" ry="7" fill="#1E1B2B" opacity="0.45"/>
      <ellipse cx="232" cy="192" rx="30" ry="7" fill="#1E1B2B" opacity="0.45"/>

      <!-- BẠN NAM ĐỨNG BÊN TRÁI NHÌN DỊU DÀNG -->
      <g class="chibi-boy-group" transform="translate(-20, 0)">
        <path d="M104 156 L104 187 L114 187 L114 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <path d="M117 156 L117 187 L127 187 L127 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <ellipse cx="109" cy="189" rx="8" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="123" cy="189" rx="8" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>

        <path d="M101 120 Q97 140 100 160 L131 160 Q134 140 129 120 Z" fill="#7D96BA" stroke="#522D24" stroke-width="2.8"/>
        <path d="M111 124 Q114 140 112 153" stroke="#FAD4C0" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M111 124 Q114 140 112 153" stroke="#522D24" stroke-width="2.5" stroke-linecap="round"/>

        <g transform="rotate(-5 115 92)">
          <circle cx="86" cy="94" r="8" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
          <path d="M88 66 C86 96 93 116 119 116 C143 116 149 96 146 66 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
          <ellipse cx="106" cy="97" rx="6" ry="3.5" fill="#FF9494" opacity="0.55"/>
          <ellipse cx="137" cy="96" rx="5.5" ry="3.2" fill="#FF9494" opacity="0.55"/>
          <ellipse cx="113" cy="88" rx="4.8" ry="5.8" fill="#43261E"/>
          <circle cx="112" cy="85.5" r="2" fill="#FFFFFF"/>
          <ellipse cx="136" cy="88" rx="4.6" ry="5.6" fill="#43261E"/>
          <circle cx="135" cy="85.5" r="2" fill="#FFFFFF"/>
          <!-- Nụ cười mỉm nhẹ nhàng -->
          <path d="M121 101 Q125 103.5 129 101" stroke="#522D24" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M82 86 C76 62 90 40 116 40 C142 40 154 58 149 79 C145 68 139 64 134 72 C128 63 119 66 114 75 C108 65 98 67 93 77 Z" fill="url(#boy-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- BẠN NỮ ĐỨNG BÊN PHẢI NHÌN BÌNH YÊN -->
      <g class="chibi-girl-group" transform="translate(22, 0)">
        <!-- Tóc dài phía sau lưng (vẽ trước thân áo/váy) -->
        <path d="M176 80 C170 108 173 136 182 146 C192 152 226 152 234 142 C240 128 236 102 230 80 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.8"/>

        <path d="M196 160 L195 187 L203 187 L204 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <path d="M209 160 L210 187 L218 187 L217 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="198" cy="189" rx="7.5" ry="3.8" fill="#6D4335" stroke="#522D24" stroke-width="2.4"/>
        <ellipse cx="214" cy="189" rx="7.5" ry="3.8" fill="#6D4335" stroke="#522D24" stroke-width="2.4"/>

        <!-- Chân váy tím xanh & áo hồng dịu đúng chuẩn reject.png -->
        <path d="M188 147 L182 166 L228 166 L222 147 Z" fill="#525870" stroke="#522D24" stroke-width="2.7" stroke-linejoin="round"/>
        <path d="M191 121 L187 149 L223 149 L219 121 Z" fill="#E9979E" stroke="#522D24" stroke-width="2.7" stroke-linejoin="round"/>

        <g transform="rotate(5 206 96)">
          <path d="M177 70 C175 98 182 117 205 117 C228 117 234 98 232 70 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
          <ellipse cx="184" cy="98" rx="6" ry="3.5" fill="#FF8A8A" opacity="0.6"/>
          <ellipse cx="215" cy="99" rx="6" ry="3.5" fill="#FF8A8A" opacity="0.6"/>
          <ellipse cx="186" cy="89" rx="4.8" ry="5.8" fill="#4A2A20"/>
          <circle cx="184.5" cy="86" r="2.1" fill="#FFFFFF"/>
          <ellipse cx="210" cy="89" rx="4.8" ry="5.8" fill="#4A2A20"/>
          <circle cx="208.5" cy="86" r="2.1" fill="#FFFFFF"/>
          <path d="M195 102 Q199 104 203 102" stroke="#522D24" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M174 88 C170 63 184 46 206 46 C228 46 240 64 236 88 C231 75 225 70 219 79 C214 68 205 67 199 78 C192 68 184 71 174 88 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>`;
  },

  // 5. TỪ CHỐI GĐ 3 (08s-12s): Hai nhân vật quay lưng ngắm bầu trời hoàng hôn (reject.png GĐ 3)
  svgBackSunset() {
    return `
    <svg viewBox="0 0 320 210" class="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${this.commonDefs()}
      <ellipse cx="106" cy="192" rx="31" ry="7" fill="#1E1B2B" opacity="0.45"/>
      <ellipse cx="214" cy="192" rx="31" ry="7" fill="#1E1B2B" opacity="0.45"/>

      <!-- BẠN NAM QUAY LƯNG NGẮM HOÀNG HÔN -->
      <g class="chibi-boy-group">
        <path d="M95 156 L95 187 L105 187 L105 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <path d="M108 156 L108 187 L118 187 L118 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <ellipse cx="100" cy="189" rx="8" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="114" cy="189" rx="8" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>

        <!-- Lưng áo nam -->
        <path d="M90 120 L87 159 L126 159 L123 120 Z" fill="#6F86AA" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M90 123 Q83 138 87 151" stroke="#6F86AA" stroke-width="7" stroke-linecap="round"/>
        <path d="M90 123 Q83 138 87 151" stroke="#522D24" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M123 123 Q130 138 126 151" stroke="#6F86AA" stroke-width="7" stroke-linecap="round"/>
        <path d="M123 123 Q130 138 126 151" stroke="#522D24" stroke-width="2.6" stroke-linecap="round"/>

        <!-- Đầu nam nhìn từ phía sau -->
        <circle cx="75" cy="93" r="7.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
        <circle cx="137" cy="93" r="7.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
        <path d="M72 82 C68 54 84 38 106 38 C128 38 144 54 140 82 C138 104 126 116 106 116 C86 116 74 104 72 82 Z" fill="url(#boy-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        <path d="M86 108 Q96 115 106 114 Q116 115 126 108" stroke="#35201C" stroke-width="2.4" stroke-linecap="round"/>
      </g>

      <!-- BẠN NỮ QUAY LƯNG NGẮM HOÀNG HÔN -->
      <g class="chibi-girl-group">
        <path d="M202 158 L201 187 L209 187 L210 158 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <path d="M216 158 L217 187 L225 187 L224 158 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="205" cy="189" rx="7.5" ry="3.8" fill="#6D4335" stroke="#522D24" stroke-width="2.4"/>
        <ellipse cx="221" cy="189" rx="7.5" ry="3.8" fill="#6D4335" stroke="#522D24" stroke-width="2.4"/>

        <!-- Chân váy & lưng áo nữ -->
        <path d="M194 146 L188 165 L238 165 L232 146 Z" fill="#525870" stroke="#522D24" stroke-width="2.7" stroke-linejoin="round"/>
        <path d="M197 122 L193 148 L233 148 L229 122 Z" fill="#E9979E" stroke="#522D24" stroke-width="2.7" stroke-linejoin="round"/>

        <!-- Mái tóc dài nhìn từ phía sau -->
        <path d="M180 82 C176 54 192 44 213 44 C234 44 250 54 246 82 C248 112 245 140 237 148 C224 154 202 154 189 148 C181 140 178 112 180 82 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
        <path d="M196 138 Q213 144 230 138" stroke="#4D2F25" stroke-width="2.2" stroke-linecap="round"/>
      </g>
    </svg>`;
  },

  // 6. TỪ CHỐI GĐ 4 (12s-15s): Hai người bạn tốt mỉm cười nhẹ nhàng nhìn về phía trước (reject.png GĐ 4)
  svgFriendsSmile() {
    return `
    <svg viewBox="0 0 320 210" class="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${this.commonDefs()}
      <ellipse cx="114" cy="192" rx="33" ry="7.5" fill="#1E1B2B" opacity="0.45"/>
      <ellipse cx="206" cy="192" rx="33" ry="7.5" fill="#1E1B2B" opacity="0.45"/>

      <!-- BẠN NAM ĐỨNG CHÍNH DIỆN MỈM CƯỜI BÌNH YÊN -->
      <g class="chibi-boy-group">
        <path d="M104 156 L102 187 L112 187 L114 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <path d="M117 156 L119 187 L129 187 L127 156 Z" fill="#3D4354" stroke="#522D24" stroke-width="2.8"/>
        <ellipse cx="107" cy="189" rx="8.5" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="124" cy="189" rx="8.5" ry="4" fill="#5D3B30" stroke="#522D24" stroke-width="2.5"/>

        <path d="M98 119 L95 159 L135 159 L132 119 Z" fill="#6F86AA" stroke="#522D24" stroke-width="2.8" stroke-linejoin="round"/>
        <!-- Hai tay buông nhẹ thoải mái -->
        <path d="M98 122 L87 145 L94 148 L101 130 Z" fill="#6F86AA" stroke="#522D24" stroke-width="2.6" stroke-linejoin="round"/>
        <circle cx="89" cy="148" r="4.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.4"/>
        <path d="M132 122 L143 145 L136 148 L129 130 Z" fill="#6F86AA" stroke="#522D24" stroke-width="2.6" stroke-linejoin="round"/>
        <circle cx="141" cy="148" r="4.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.4"/>

        <!-- Đầu nam chính diện -->
        <circle cx="81" cy="94" r="7.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
        <circle cx="149" cy="94" r="7.5" fill="#FAD4C0" stroke="#522D24" stroke-width="2.7"/>
        <path d="M83 65 C81 96 89 116 115 116 C141 116 149 96 147 65 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
        <ellipse cx="97" cy="98" rx="6.5" ry="3.8" fill="#FF9494" opacity="0.65"/>
        <ellipse cx="133" cy="98" rx="6.5" ry="3.8" fill="#FF9494" opacity="0.65"/>
        <!-- Mắt cười hiền hòa ^ ^ -->
        <path d="M95 90 Q101 83 107 90" stroke="#522D24" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <path d="M123 90 Q129 83 135 90" stroke="#522D24" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <path d="M110 100 Q115 106 120 100" stroke="#522D24" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M79 84 C73 60 87 38 115 38 C143 38 157 58 151 84 C146 70 139 66 133 75 C127 64 117 66 112 76 C106 65 95 67 89 77 Z" fill="url(#boy-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
      </g>

      <!-- BẠN NỮ ĐỨNG CHÍNH DIỆN MỈM CƯỜI BÌNH YÊN -->
      <g class="chibi-girl-group">
        <path d="M174 82 C168 110 170 138 180 148 C190 154 226 154 236 144 C243 130 239 104 233 82 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.8"/>

        <path d="M195 160 L194 187 L202 187 L203 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <path d="M209 160 L210 187 L218 187 L217 160 Z" fill="#FAD4C0" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="197" cy="189" rx="8" ry="4" fill="#6D4335" stroke="#522D24" stroke-width="2.5"/>
        <ellipse cx="214" cy="189" rx="8" ry="4" fill="#6D4335" stroke="#522D24" stroke-width="2.5"/>

        <path d="M186 146 L179 165 L231 165 L224 146 Z" fill="#525870" stroke="#522D24" stroke-width="2.7" stroke-linejoin="round"/>
        <path d="M189 121 L185 148 L225 148 L221 121 Z" fill="#E9979E" stroke="#522D24" stroke-width="2.7" stroke-linejoin="round"/>
        <path d="M189 124 L178 145 L185 148 L192 131 Z" fill="#E9979E" stroke="#522D24" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="180" cy="148" r="4.2" fill="#FAD4C0" stroke="#522D24" stroke-width="2.3"/>
        <path d="M221 124 L232 145 L225 148 L218 131 Z" fill="#E9979E" stroke="#522D24" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="230" cy="148" r="4.2" fill="#FAD4C0" stroke="#522D24" stroke-width="2.3"/>

        <!-- Đầu nữ chính diện -->
        <path d="M175 70 C173 99 180 118 205 118 C230 118 237 99 235 70 Z" fill="url(#skin-grad)" stroke="#522D24" stroke-width="2.9"/>
        <ellipse cx="188" cy="100" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.68"/>
        <ellipse cx="222" cy="100" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.68"/>
        <!-- Mắt cười hiền hòa ^ ^ -->
        <path d="M186 92 Q192 85 198 92" stroke="#522D24" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <path d="M212 92 Q218 85 224 92" stroke="#522D24" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <path d="M200 102 Q205 107 210 102" stroke="#522D24" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M172 89 C168 64 182 47 205 47 C228 47 239 65 235 89 C230 76 224 70 218 80 C213 69 204 68 198 79 C191 69 182 72 172 89 Z" fill="url(#girl-hair-grad)" stroke="#522D24" stroke-width="2.9" stroke-linejoin="round"/>
      </g>
    </svg>`;
  }
};
