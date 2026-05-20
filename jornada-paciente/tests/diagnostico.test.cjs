const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { ServiceBuilder } = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");

// reduz logs
let options = new chrome.Options();
options.excludeSwitches("enable-logging");

(async function testeDiagnostico() {

    let service = new ServiceBuilder(chromedriver.path);

    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .setChromeService(service)
        .build();

    try {

        // LOGIN
        await driver.get("http://localhost:5173");

        await driver.wait(
            until.elementLocated(By.name("email")),
            10000
        );

        // email
        await driver.findElement(By.name("email"))
            .sendKeys("oncologista@teste.com");

        await driver.sleep(2000);

        // senha
        await driver.findElement(By.name("senha"))
            .sendKeys("123456");

        await driver.sleep(2000);

        // entrar
        await driver.findElement(By.id("btn-login"))
            .click();

        // espera página pacientes
        await driver.wait(
            until.urlContains("pacientes"),
            10000
        );

        console.log("✅ Login realizado!");

        await driver.sleep(3000);

        // VER DETALHES
        await driver.findElement(By.id("btn-ver-detalhes"))
            .click();

        await driver.sleep(3000);

        // ACESSAR DIAGNÓSTICO
        await driver.findElement(By.id("btn-acessar-diagnostico"))
            .click();

        await driver.sleep(3000);

        // espera botão diagnóstico
        await driver.wait(
            until.elementLocated(By.id("btn-novo-diagnostico")),
            10000
        );

        // abre modal
        await driver.findElement(By.id("btn-novo-diagnostico"))
            .click();

        await driver.sleep(2000);

        // título
        await driver.findElement(By.name("titulo"))
            .sendKeys("Diabetes Tipo 2");

        await driver.sleep(2000);

        // descrição
        await driver.findElement(By.name("descricao"))
            .sendKeys("Paciente apresenta alteração glicêmica.");

        await driver.sleep(2000);

        // data
        await driver.findElement(By.name("data"))
            .sendKeys("01052026");

        await driver.sleep(2000);

        // médico
        await driver.findElement(By.name("medico"))
            .sendKeys("Dr. João");

        await driver.sleep(2000);

        // observações
        await driver.findElement(By.name("observacoes"))
            .sendKeys("Necessário acompanhamento mensal.");

        await driver.sleep(2000);

        // salvar
        await driver.findElement(By.id("btn-salvar-diagnostico"))
            .click();

        await driver.sleep(3000);

        console.log("✅ Diagnóstico criado com sucesso!");

        // deixa aberto
        await driver.sleep(5000);

    } catch (erro) {

        console.log("❌ Erro no teste:", erro);

    } finally {

        await driver.quit();

    }

})();