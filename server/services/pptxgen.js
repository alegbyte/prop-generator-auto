const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const FILES_DIR = path.join(__dirname, '../public/files');

const NAVY = '1a1f36';
const WHITE = 'FFFFFF';
const DARK_GRAY = '333333';

async function generatePptx(slides, slug, freelancerName = 'Your Name') {
  if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
  }

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = freelancerName;
  pptx.title = slides[0]?.title || 'Upwork Proposal';

  // Slide 1 — Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: NAVY };

  titleSlide.addText(slides[0]?.title || 'Proposal', {
    x: 0.5,
    y: 1.8,
    w: '90%',
    h: 1.5,
    fontSize: 36,
    bold: true,
    color: WHITE,
    align: 'center',
    fontFace: 'Arial',
  });

  titleSlide.addText(freelancerName, {
    x: 0.5,
    y: 3.5,
    w: '90%',
    h: 0.6,
    fontSize: 18,
    color: 'AAAACC',
    align: 'center',
    fontFace: 'Arial',
  });

  addWatermark(titleSlide, WHITE);

  // Slides 2-5
  const contentSlides = slides.slice(1, 5);
  contentSlides.forEach((slideData) => {
    const slide = pptx.addSlide();
    slide.background = { color: WHITE };

    // Navy title bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.0,
      fill: { color: NAVY },
    });

    slide.addText(slideData.title || '', {
      x: 0.3,
      y: 0.1,
      w: '95%',
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: WHITE,
      fontFace: 'Arial',
      valign: 'middle',
    });

    const bullets = (slideData.bullets || []).map((b) => ({
      text: b,
      options: { bullet: { type: 'bullet' }, fontSize: 18, color: DARK_GRAY, fontFace: 'Arial' },
    }));

    if (bullets.length > 0) {
      slide.addText(bullets, {
        x: 0.5,
        y: 1.2,
        w: '90%',
        h: 4.0,
        valign: 'top',
        paraSpaceBefore: 8,
      });
    }

    addWatermark(slide, NAVY);
  });

  const filePath = path.join(FILES_DIR, `${slug}.pptx`);
  await pptx.writeFile({ fileName: filePath });
  return filePath;
}

function addWatermark(slide, color) {
  slide.addText('●', {
    x: '88%',
    y: '90%',
    w: 1.0,
    h: 0.4,
    fontSize: 10,
    color: color === WHITE ? 'CCCCCC' : '8888AA',
    align: 'right',
    fontFace: 'Arial',
  });
}

module.exports = { generatePptx };
