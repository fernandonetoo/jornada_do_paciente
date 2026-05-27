const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function criarRegulacao() {

  // =========================
  // CHROMEDRIVER + CHROMIUM
  // =========================

  const service = new chrome.ServiceBuilder(
    "/usr/bin/chromedriver"
  );

  const options = new chrome.Options();

  options.setChromeBinaryPath("/usr/bin/chromium");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeService(service)
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
    ).sendKeys("52");

    await driver.findElement(
      By.css('input[placeholder="Suspeita clínica"]')
    ).sendKeys("Necessita cirurgia cardíaca");

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
    // ADICIONAR REGULAÇÃO
    // =========================

    const btnRegulacao = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//h3[contains(., 'Regulação')]/following::button[contains(., '+ Adicionar')][1]"
        )
      ),
      10000
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      btnRegulacao
    );

    await driver.sleep(1000);

    await btnRegulacao.click();

    await driver.sleep(3000);

    // =========================
    // NOVA REGULAÇÃO
    // =========================

    const novaRegulacaoBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Nova Regulação')]")
      ),
      10000
    );

    await novaRegulacaoBtn.click();

    await driver.sleep(2500);

    // =========================
    // PREENCHER FORM
    // =========================

    const tipoRegulacao = await driver.wait(
      until.elementLocated(
        By.css('input[placeholder="Tipo (ex: Cirurgia, UTI...)"]')
      ),
      10000
    );

    await tipoRegulacao.sendKeys("Cirurgia Cardíaca");

    await driver.findElement(
      By.css('input[type="date"]')
    ).sendKeys("2026-06-10");

    const observacao = await driver.findElement(
      By.css("textarea")
    );

    await observacao.sendKeys(
      "Paciente necessita encaminhamento urgente."
    );

    // =========================
    // ENVIAR REGULAÇÃO
    // =========================

    const enviarBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Enviar para Regulação')]")
    );

    await enviarBtn.click();

    await driver.sleep(4000);

    // =========================
    // OK SUCESSO
    // =========================

    const okRegulacao = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'OK')]")
      ),
      10000
    );

    await okRegulacao.click();

    await driver.sleep(3000);

    console.log("✅ REGULAÇÃO CRIADA COM SUCESSO!");

  } catch (erro) {

    console.error("❌ ERRO NO TESTE:");
    console.error(erro);

  } finally {

    // await driver.quit();

  }

})();