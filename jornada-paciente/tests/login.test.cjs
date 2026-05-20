const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// reduz logs do Chrome
let options = new chrome.Options();
options.excludeSwitches("enable-logging");

(async function testeLogin() {

    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    try {

        await driver.get("http://localhost:5173");

        await driver.wait(
            until.elementLocated(By.name("email")),
            10000
        );

        // digita email
        await driver.findElement(By.name("email"))
            .sendKeys("paciente@teste.com");

        await driver.sleep(2000);

        // digita senha
        await driver.findElement(By.name("senha"))
            .sendKeys("123456");

        await driver.sleep(2000);

        // clica no botão
        await driver.findElement(By.id("btn-login"))
            .click();

        // valida redirecionamento
        await driver.wait(
            until.urlContains("dashboard"),
            10000
        );

        console.log("✅ Login funcionando!");

        // deixa aberto 5 segundos
        await driver.sleep(5000);

    } catch (erro) {

        console.log("❌ Erro no teste:", erro);

    } finally {

        await driver.quit();

    }

})();