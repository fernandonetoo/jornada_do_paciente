const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// reduz logs do Chrome
let options = new chrome.Options();
options.excludeSwitches("enable-logging");

(async function testeCriarConta() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    // abre a tela de criar conta
    await driver.get("http://localhost:5173/criar");

    // espera formulário aparecer
    await driver.wait(until.elementLocated(By.name("nome")), 10000);

    // nome
    await driver.findElement(By.name("nome")).sendKeys("Paciente Teste");

    await driver.sleep(2000);

    // cpf
    await driver.findElement(By.name("cpf")).sendKeys("12345678900");

    await driver.sleep(2000);

    // data
    await driver.findElement(By.name("data")).sendKeys("01/01/2000");

    await driver.sleep(2000);

    // email
    await driver.findElement(By.name("email")).sendKeys("novo@teste.com");

    await driver.sleep(2000);

    // senha
    await driver.findElement(By.name("senha")).sendKeys("123abc");

    await driver.sleep(2000);

    // cria conta
    await driver.findElement(By.id("btn-criar-conta")).click();

    await driver.sleep(2000);

    // aceita o alert
    let alert = await driver.switchTo().alert();
    await alert.accept();

    // valida retorno pro login
    await driver.wait(until.urlContains("localhost:5173"), 10000);

    console.log("✅ Conta criada com sucesso!");

    // deixa aberto 5 segundos
    await driver.sleep(5000);
  } catch (erro) {
    console.log("❌ Erro no teste:", erro);
  } finally {
    await driver.quit();
  }
})();
