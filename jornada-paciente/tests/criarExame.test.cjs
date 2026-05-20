const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function criarExame() {

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
    ).sendKeys("45");

    await driver.findElement(
      By.css('input[placeholder="Suspeita clínica"]')
    ).sendKeys("Investigação pulmonar");

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
    // ADICIONAR EXAME
    // =========================

    const btnExame = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//h3[contains(., 'Exames')]/following::button[contains(., '+ Adicionar')][1]"
        )
      ),
      10000
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      btnExame
    );

    await driver.sleep(1000);

    await btnExame.click();

    await driver.sleep(3000);

    // =========================
    // NOVO EXAME
    // =========================

    const novoExameBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Novo Exame')]")
      ),
      10000
    );

    await novoExameBtn.click();

    await driver.sleep(2500);

    // =========================
    // PREENCHER FORM EXAME
    // =========================

    const tipoExame = await driver.wait(
      until.elementLocated(
        By.css('input[placeholder="Tipo de Exame"]')
      ),
      10000
    );

    await tipoExame.sendKeys("Tomografia Computadorizada");

    // DATA
    await driver.findElement(
      By.css('input[type="date"]')
    ).sendKeys("2026-05-25");

    // LABORATÓRIO
    await driver.findElement(
      By.css('input[placeholder="Laboratório"]')
    ).sendKeys("Laboratório Central");

    // MÉDICO
    await driver.findElement(
      By.css('input[placeholder="Médico solicitante"]')
    ).sendKeys("Dr. João");

    // OBSERVAÇÃO
    await driver.findElement(
      By.css('textarea[placeholder="Observações (opcional)"]')
    ).sendKeys("Paciente precisa realizar exame em jejum.");

    await driver.sleep(2000);

    // =========================
    // SOLICITAR EXAME
    // =========================

    const solicitarBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Solicitar Exame')]")
    );

    await solicitarBtn.click();

    await driver.sleep(4000);

    // =========================
    // OK SUCESSO
    // =========================

    const okExame = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'OK')]")
      ),
      10000
    );

    await okExame.click();

    await driver.sleep(3000);

    console.log("✅ EXAME CRIADO COM SUCESSO!");

  } catch (erro) {

    console.error("❌ ERRO NO TESTE:");
    console.error(erro);

  } finally {

    // await driver.quit();

  }

})();