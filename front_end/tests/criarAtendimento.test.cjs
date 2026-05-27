const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function criarAtendimento() {

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
    // BOTÃO NOVO ATENDIMENTO
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
    // PREENCHER FORMULÁRIO
    // =========================

    const inputNome = await driver.wait(
      until.elementLocated(
        By.css('input[placeholder="Nome do paciente"]')
      ),
      10000
    );

    await inputNome.sendKeys("Paciente Selenium");

    await driver.findElement(
      By.css('input[placeholder="Idade"]')
    ).sendKeys("30");

    await driver.findElement(
      By.css('input[placeholder="Suspeita clínica"]')
    ).sendKeys("Suspeita de hipertensão");

    // =========================
    // INICIAR ATENDIMENTO
    // =========================

    const iniciarBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Iniciar Atendimento')]")
    );

    await iniciarBtn.click();

    await driver.sleep(3000);

    // =========================
    // MODAL SUCESSO
    // =========================

    const okBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'OK')]")
      ),
      10000
    );

    await okBtn.click();

    await driver.sleep(3000);

    console.log("✅ ATENDIMENTO CRIADO COM SUCESSO!");

  } catch (erro) {

    console.error("❌ ERRO NO TESTE:");
    console.error(erro);

  } finally {

    // await driver.quit();

  }

})();