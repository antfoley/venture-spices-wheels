function resizeCanvas() {
    const canvas = document.getElementById("wheel");
    const parentWidth = canvas.parentElement.clientWidth;
    const size = Math.min(parentWidth, 400); // max 400px for clarity
  
    // Set display size
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
  
    // Set internal resolution for crisp drawing
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
  
    return { canvas, ctx: canvas.getContext("2d"), size: canvas.width, scale };
  }
  
  function drawSegmentedWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4; // 40% of the canvas size
    const stepAngle = (2 * Math.PI) / groups.length; // Angle for each segment
  
    ctx.clearRect(0, 0, width, height);
  
    // Draw segments
    groups.forEach((group, index) => {
      const startAngle = index * stepAngle;
      const endAngle = startAngle + stepAngle;
      const value = state[group].reduce((sum, val) => sum + (val || 0), 0) / (QUESTIONS[group].length * 5); // Average value (0 to 1)
      const segmentRadius = radius * value;
  
      // Draw segment background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = `rgba(139, 92, 246, 0.1)`; // Light purple background
      ctx.fill();
  
      // Draw segment value
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, segmentRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = `rgba(139, 92, 246, 0.6)`; // Darker purple for value
      ctx.fill();
  
      // Draw segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.stroke();
    });
  
    // Draw category labels
    groups.forEach((group, index) => {
      const angle = index * stepAngle - Math.PI / 2; // Adjust for starting at top
      const labelX = centerX + Math.cos(angle) * (radius + 20); // Position outside the wheel
      const labelY = centerY + Math.sin(angle) * (radius + 20);
  
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(group, labelX, labelY);
    });
  }
  
  window.onload = () => {
    drawSegmentedWheel();
  };
  
  window.onresize = () => {
    drawSegmentedWheel();
  };
  
  // Keep setAnswer global
  window.setAnswer = setAnswer;
  