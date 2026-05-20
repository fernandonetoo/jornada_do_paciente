<button
  onClick={() => {
    localStorage.clear();
    alert("Dados apagados!");
    window.location.reload();
  }}
>
  Limpar Sistema
</button>