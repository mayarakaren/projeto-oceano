let chatbotAberto = false;

function abrirChatbot() {
  const chatbot = document.querySelector("df-messenger");

  if (!chatbot) return;

  if (!chatbotAberto) {
    chatbot.style.display = "block";
    chatbotAberto = true;
  } else {
    chatbot.style.display = "none";
    chatbotAberto = false;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const chatPreview = document
      .querySelector("df-messenger")
      ?.shadowRoot?.querySelector("df-messenger-chat");

    if (chatPreview) {
      chatPreview.style.display = "none";
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});


function abrirReconhecimento() {
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play();

      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100vw";
      modal.style.height = "100vh";
      modal.style.background = "rgba(0,0,0,0.8)";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.appendChild(video);

      const botaoFoto = document.createElement("button");
      botaoFoto.innerText = "Tirar Foto";
      botaoFoto.style.position = "absolute";
      botaoFoto.style.bottom = "20px";
      botaoFoto.style.padding = "10px 20px";
      modal.appendChild(botaoFoto);

      document.body.appendChild(modal);

      botaoFoto.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
          const formData = new FormData();
          formData.append("imagem", blob, "foto.jpg");

          fetch("/analisa-rosto", {
            method: "POST",
            body: formData
          })
          .then(res => res.json())
          .then(data => {
            console.log("Resposta da IA:", data);
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
            localStorage.setItem("emocao", data.emocao);
            localStorage.setItem("imagem", data.imagem_fundo);
            window.location.href = "/resultado.html";
          })
          .catch(err => {
            console.error("Erro ao enviar imagem:", err);
            alert("Erro ao processar imagem.");
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
          });
        }, "image/jpeg");
      };
    });
}

