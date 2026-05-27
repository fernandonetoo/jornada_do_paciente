const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { ServiceBuilder } = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");

// reduz logs do Chrome
let options = new chrome.Options();
options.excludeSwitches("enable-logging");

(async function testeVerConsulta() {

    // configura chromedriver
    let service = new ServiceBuilder(chromedriver.path);

    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .setChromeService(service)
        .build();

    try {

        // abre login
        await driver.get("http://localhost:5173");

        // espera inputs
        await driver.wait(
            until.elementLocated(By.name("email")),
            10000
        );

        // email oncologista
        await driver.findElement(By.name("email"))
            .sendKeys("oncologista@teste.com");

        await driver.sleep(2000);

        // senha
        await driver.findElement(By.name("senha"))
            .sendKeys("123456");

        await driver.sleep(2000);

        // login
        await driver.findElement(By.id("btn-login"))
            .click();

        await driver.sleep(3000);

        // entra em detalhes do paciente
        await driver.wait(
            until.elementLocated(By.id("btn-ver-detalhes")),
            10000
        );

        await driver.findElement(By.id("btn-ver-detalhes"))
            .click();

        await driver.sleep(3000);

        // pega TODOS os botões "Ver →"
        let botoes = await driver.findElements(By.css("button"));

        // clica no PRIMEIRO (consulta)
        await botoes[0].click();

        await driver.sleep(4000);

        console.log("✅ Tela de consultas aberta com sucesso!");

        // deixa aberto
        await driver.sleep(5000);

    } catch (erro) {

        console.log("❌ Erro no teste:", erro);

    } finally {

        await driver.quit();

    }

})();