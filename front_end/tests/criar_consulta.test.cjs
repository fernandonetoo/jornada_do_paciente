// tests/criar_consulta.test.cjs
// Comando: node tests/criar_consulta.test.cjs

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

(async function criarConsulta() {

  // =========================
  // CHROME
  // =========================

  const options = new chrome.Options();

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {

    // =========================
    // ABRIR SISTEMA
    // =========================

    await driver.get("http://localhost:5173");

    await driver.manage().window().maximize();

    await driver.sleep(2000);

    // =========================
    // LOGIN
    // =========================

    await driver.findElement(By.name("email"))
      .sendKeys("medico@ubs.com");

    await driver.findElement(By.name("senha"))
      .sendKeys("123456");

    await driver.findElement(By.id("btn-login"))
      .click();

    await driver.sleep(4000);

    // =========================
    // NOVO ATENDIMENTO
    // =========================

    const btnNovo = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Novo Atendimento')]")
      ),
      10000
    );

    await btnNovo.click();

    await driver.sleep(2000);

    // =========================
    // PREENCHER PACIENTE
    // =========================

    await driver.findElement(
      By.css('input[placeholder="Nome do paciente"]')
    ).sendKeys("Paciente Selenium");

    await driver.findElement(
      By.css('input[placeholder="Idade"]')
    ).sendKeys("30");

    await driver.findElement(
      By.css('input[placeholder="Suspeita clínica"]')
    ).sendKeys("Câncer de Pele");

    // =========================
    // INICIAR ATENDIMENTO
    // =========================

    await driver.findElement(
      By.xpath("//button[contains(., 'Iniciar Atendimento')]")
    ).click();

    await driver.sleep(2500);

    // =========================
    // OK SUCESSO
    // =========================

    const okBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'OK')]")
      ),
      10000
    );

    await okBtn.click();

    await driver.sleep(4000);

    // =========================
    // VER DETALHES
    // =========================

    const verDetalhes = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Ver detalhes')]")
      ),
      10000
    );

    await verDetalhes.click();

    await driver.sleep(3000);

    // =========================
    // CLICAR + ADICIONAR
    // =========================

    const adicionarConsulta = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., '+ Adicionar')]")
      ),
      10000
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      adicionarConsulta
    );

    await driver.sleep(1000);

    await adicionarConsulta.click();

    await driver.sleep(3000);

    // =========================
    // CLICAR EM NOVA CONSULTA
    // =========================

    const novaConsultaBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Nova Consulta')]")
      ),
      10000
    );

    await novaConsultaBtn.click();

    await driver.sleep(2000);

    // =========================
    // FORM CONSULTA
    // =========================

    const tipoConsulta = await driver.wait(
      until.elementLocated(
        By.css('input[placeholder="Tipo de Consulta"]')
      ),
      10000
    );

    await tipoConsulta.sendKeys("Consulta Oncológica");

    await driver.findElement(
      By.css('input[placeholder="Selecionar o médico"]')
    ).sendKeys("Dr. João");

    // DATA
    const inputData = await driver.findElement(
      By.css('input[type="date"]')
    );

    await driver.executeScript(`
      var input = arguments[0];

      var nativeInputValueSetter =
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;

      nativeInputValueSetter.call(input, '2026-05-20');

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
    ).sendKeys("UBS Central");

    // OBSERVAÇÕES
    await driver.findElement(
      By.css('textarea[placeholder="Observações (opcional)"]')
    ).sendKeys("Consulta criada via Selenium");

    // =========================
    // SOLICITAR CONSULTA
    // =========================

    const solicitarBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Solicitar Nova Consulta')]")
    );

    await driver.executeScript(
      "arguments[0].click();",
      solicitarBtn
    );

    await driver.sleep(4000);

    // =========================
    // OK SUCESSO CONSULTA
    // =========================

    const okConsulta = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'OK')]")
      ),
      10000
    );

    await driver.executeScript(
      "arguments[0].click();",
      okConsulta
    );

    await driver.sleep(3000);

    console.log("✅ CONSULTA CRIADA COM SUCESSO!");

  } catch (erro) {

    console.error("❌ ERRO NO TESTE:");

    console.error(erro);

  } finally {

    // await driver.quit();

  }

})();