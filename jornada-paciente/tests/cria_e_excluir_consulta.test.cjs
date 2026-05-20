// tests/cria_e_excluir_consulta.test.cjs
// Comando: node tests/cria_e_excluir_consulta.test.cjs

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

const BASE = "http://localhost:5173";

(async function criarEExcluirConsulta() {

  const options = new chrome.Options();

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {

    // =====================================
    // ABRIR SISTEMA
    // =====================================

    await driver.get(BASE);

    await driver.manage().window().maximize();

    await driver.sleep(2000);

    // =====================================
    // SEED
    // =====================================

    await driver.executeScript(() => {

      const usuarios = [
        {
          nome: "Dr. UBS Teste",
          email: "medico@ubs.com",
          senha: "123456",
          cpf: "00000000000",
          grupos: ["medico_ubs"],
        },
      ];

      localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
      );

      localStorage.removeItem("pacientes");
      localStorage.removeItem("consulta");

    });

    console.log("✅ Seed realizada");

    await driver.navigate().refresh();

    await driver.sleep(2000);

    // =====================================
    // LOGIN
    // =====================================

    console.log("⏳ Fazendo login...");

    await driver.wait(
      until.elementLocated(By.name("email")),
      15000
    );

    await driver.findElement(By.name("email"))
      .sendKeys("medico@ubs.com");

    await driver.findElement(By.name("senha"))
      .sendKeys("123456");

    const btnLogin = await driver.findElement(
      By.id("btn-login")
    );

    await driver.executeScript(
      "arguments[0].click();",
      btnLogin
    );

    await driver.wait(
      until.urlContains("criaratendimento"),
      15000
    );

    console.log("✅ Login realizado");

    // =====================================
    // BOTÃO NOVO ATENDIMENTO
    // =====================================

    const btnNovo = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Novo Atendimento')]")
      ),
      15000
    );

    await driver.wait(
      until.elementIsVisible(btnNovo),
      15000
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      btnNovo
    );

    await driver.sleep(1000);

    await driver.executeScript(
      "arguments[0].click();",
      btnNovo
    );

    console.log("✅ Clique em Novo Atendimento");

    await driver.sleep(2500);

    // =====================================
    // FORM PACIENTE
    // =====================================

    console.log("⏳ Preenchendo formulário...");

    // NOME
    const inputNome = await driver.wait(
      until.elementLocated(
        By.css('input[placeholder="Nome do paciente"]')
      ),
      15000
    );

    await driver.wait(
      until.elementIsVisible(inputNome),
      15000
    );

    await driver.executeScript(`
      const input = arguments[0];

      const nativeInputValueSetter =
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;

      nativeInputValueSetter.call(
        input,
        'Paciente Consulta'
      );

      input.dispatchEvent(
        new Event('input', { bubbles: true })
      );

      input.dispatchEvent(
        new Event('change', { bubbles: true })
      );
    `, inputNome);

    // IDADE
    const inputIdade = await driver.findElement(
      By.css('input[placeholder="Idade"]')
    );

    await driver.executeScript(`
      const input = arguments[0];

      const nativeInputValueSetter =
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;

      nativeInputValueSetter.call(
        input,
        '38'
      );

      input.dispatchEvent(
        new Event('input', { bubbles: true })
      );

      input.dispatchEvent(
        new Event('change', { bubbles: true })
      );
    `, inputIdade);

    // SUSPEITA
    const inputSuspeita = await driver.findElement(
      By.css('input[placeholder="Suspeita clínica"]')
    );

    await driver.executeScript(`
      const input = arguments[0];

      const nativeInputValueSetter =
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;

      nativeInputValueSetter.call(
        input,
        'Dor abdominal'
      );

      input.dispatchEvent(
        new Event('input', { bubbles: true })
      );

      input.dispatchEvent(
        new Event('change', { bubbles: true })
      );
    `, inputSuspeita);

    console.log("✅ Formulário preenchido");

    await driver.sleep(1500);

    // =====================================
    // INICIAR ATENDIMENTO
    // =====================================

    const iniciarBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Iniciar Atendimento')]")
      ),
      15000
    );

    await driver.executeScript(
      "arguments[0].click();",
      iniciarBtn
    );

    console.log("✅ Atendimento iniciado");

    await driver.sleep(3000);

    // =====================================
    // OK MODAL
    // =====================================

    try {

      const okBtn = await driver.wait(
        until.elementLocated(
          By.xpath("//button[contains(., 'OK')]")
        ),
        10000
      );

      await driver.executeScript(
        "arguments[0].click();",
        okBtn
      );

      console.log("✅ Modal OK fechado");

    } catch (_) {

      console.log("⚠️ Modal OK não apareceu");

    }

    await driver.sleep(2500);

    // =====================================
    // VER DETALHES
    // =====================================

    const verDetalhes = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Ver detalhes')]")
      ),
      15000
    );

    await driver.executeScript(
      "arguments[0].click();",
      verDetalhes
    );

    await driver.wait(
      until.urlContains("gerenciar"),
      15000
    );

    console.log("✅ Tela gerenciar aberta");

    await driver.sleep(3000);

    // =====================================
    // + ADICIONAR
    // =====================================

    const botoesAdicionar = await driver.wait(
      until.elementsLocated(
        By.xpath("//button[contains(., '+ Adicionar')]")
      ),
      15000
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      botoesAdicionar[0]
    );

    await driver.sleep(1000);

    await driver.executeScript(
      "arguments[0].click();",
      botoesAdicionar[0]
    );

    await driver.wait(
      until.urlContains("criarconsulta"),
      15000
    );

    console.log("✅ Tela criarconsulta aberta");

    await driver.sleep(3000);

    // =====================================
    // NOVA CONSULTA
    // =====================================

    const novaConsultaBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Nova Consulta')]")
      ),
      15000
    );

    await driver.executeScript(
      "arguments[0].click();",
      novaConsultaBtn
    );

    await driver.sleep(2500);

    // =====================================
    // FORM CONSULTA
    // =====================================

    const inputTipo = await driver.wait(
      until.elementLocated(
        By.css('input[placeholder="Tipo de Consulta"]')
      ),
      15000
    );

    await inputTipo.sendKeys("Cardiologia");

    await driver.findElement(
      By.css('input[placeholder="Selecionar o médico"]')
    ).sendKeys("Dr. João");

    // DATA
    const inputData = await driver.findElement(
      By.css('input[type="date"]')
    );

    await driver.executeScript(`
      const input = arguments[0];

      const nativeInputValueSetter =
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;

      nativeInputValueSetter.call(
        input,
        '2026-06-10'
      );

      input.dispatchEvent(
        new Event('input', { bubbles: true })
      );

      input.dispatchEvent(
        new Event('change', { bubbles: true })
      );
    `, inputData);

    // HORÁRIO
    await driver.findElement(
      By.css('input[placeholder="Horário"]')
    ).sendKeys("14:00");

    // UNIDADE
    await driver.findElement(
      By.css('input[placeholder="Unidade de saúde"]')
    ).sendKeys("UBS Centro");

    // OBS
    await driver.findElement(
      By.css("textarea")
    ).sendKeys(
      "Paciente necessita avaliação cardiológica."
    );

    console.log("✅ Form consulta preenchido");

    await driver.sleep(1000);

    // =====================================
    // SOLICITAR
    // =====================================

    const solicitarBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Solicitar Nova Consulta')]")
    );

    await driver.executeScript(
      "arguments[0].click();",
      solicitarBtn
    );

    console.log("✅ Solicitação enviada");

    await driver.sleep(3000);

    // =====================================
    // ALERTA
    // =====================================

    try {

      const alerta = await driver.switchTo().alert();

      const msg = await alerta.getText();

      console.log("❌ ALERTA:", msg);

      await alerta.accept();

    } catch (_) {}

    // =====================================
    // OK CONSULTA
    // =====================================

    const okConsulta = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'OK')]")
      ),
      15000
    );

    await driver.executeScript(
      "arguments[0].click();",
      okConsulta
    );

    console.log("✅ Consulta criada");

    await driver.sleep(3000);

    // =====================================
    // MENU ⋯
    // =====================================

    const menuTresPontos = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., '⋯')]")
      ),
      15000
    );

    await driver.executeScript(
      "arguments[0].click();",
      menuTresPontos
    );

    await driver.sleep(1500);

    // =====================================
    // EXCLUIR
    // =====================================

    const excluirItem = await driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(text(),'Excluir')]")
      ),
      15000
    );

    await driver.executeScript(
      "arguments[0].click();",
      excluirItem
    );

    await driver.sleep(1000);

    try {

      const alertaExcluir = await driver.switchTo().alert();

      await alertaExcluir.accept();

      console.log("✅ Exclusão confirmada");

    } catch (_) {}

    await driver.sleep(3000);

    // =====================================
    // VERIFICAÇÃO
    // =====================================

    const celulas = await driver.findElements(
      By.xpath("//*[contains(text(),'Cardiologia')]")
    );

    if (celulas.length === 0) {

      console.log(
        "✅ Consulta excluída com sucesso"
      );

    } else {

      console.error(
        "❌ Consulta ainda existe na tela"
      );

    }

    console.log("\n🎉 TESTE FINALIZADO!");

  } catch (erro) {

    console.error("\n❌ ERRO NO TESTE:");

    console.error(erro);

  } finally {

    await driver.sleep(3000);

    await driver.quit();

  }

})();