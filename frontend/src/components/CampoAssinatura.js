import React, { useRef, useEffect } from 'react';

const CampoAssinatura = ({ titulo, imagemInicial, onSalvar, disabled = false }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (imagemInicial && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Limpa canvas antes de desenhar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //Desenha a imagem redimensionada para o tamanho do canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log('Assinatura carregada no canvas');
      };

      img.onerror = () => {
        console.error('Erro ao carregar a imagem da assinatura');
      };

      img.src = imagemInicial;
    } else if (canvasRef.current) {
       //Limpa canvas se não tem imagem
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      console.log('Canvas limpo (sem assinatura)');
    }
  }, [imagemInicial]);

  //teste

  const startDesenho = (e) => {
    if (disabled) return;
    isDrawing.current = true;
    desenhar(e);
  };

  const fimDesenho = () => {
    if (disabled) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    const imagem = canvas.toDataURL();
    onSalvar(imagem);
  };

  const desenhar = (e) => {
    if (disabled) return;
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const limpar = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    onSalvar('');
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <h4>{titulo}</h4>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{
          border: '1px solid black',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'crosshair',
          touchAction: disabled ? 'none' : 'auto',
        }}
        onMouseDown={startDesenho}
        onMouseUp={fimDesenho}
        onMouseMove={desenhar}
        onTouchStart={startDesenho}
        onTouchEnd={fimDesenho}
        onTouchMove={desenhar}
      />
      <br />
      <button type="button" onClick={limpar} disabled={disabled}>
        Limpar Assinatura
      </button>
    </div>
  );
};

export default CampoAssinatura;
