async (page) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  const widths = [320,360,375,390,414,480,519,520,521,599,600,601,759,760,761,767,768,769,899,900,901,1023,1024,1025,1099,1100,1101,1199,1200,1201,1366,1440,1599,1600,1601,1699,1700,1701,1799,1800,1801,1920,2560];
  const sizes = widths.map(width => ({ width, height: 900 })).concat([{width:568,height:320},{width:667,height:375},{width:844,height:390},{width:1024,height:600},{width:1366,height:768},{width:1920,height:1080}]);
  const failures = [];
  for (const size of sizes) {
    await page.setViewportSize(size);
    const result = await page.evaluate(() => {
      const clipped = [], outside = [];
      for (const element of document.querySelectorAll('header *, main *, footer *')) {
        if (!element.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}) || element.closest('[aria-hidden="true"]') || ![...element.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const rect = element.getBoundingClientRect();
        const entry = {class:element.className,text:element.textContent.trim().slice(0,65)};
        if (element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 3) clipped.push(entry);
        if (rect.left < -2 || rect.right > innerWidth + 2) outside.push({...entry,left:Math.round(rect.left),right:Math.round(rect.right)});
      }
      return {clipped,outside,overflow:document.documentElement.scrollWidth > innerWidth};
    });
    if (result.clipped.length || result.outside.length || result.overflow) failures.push({size,...result});
  }
  if (failures.length) throw new Error(JSON.stringify(failures));
  return {tested:sizes.length,failures};
}
