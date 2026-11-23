const mysql = require("mysql2/promise");
const config = require("./src/config");

async function criarBancoTestes() {
    const { database, ...serverConfig } = config.db;

    const origem = await mysql.createConnection(config.db);
    const servidor = await mysql.createConnection(serverConfig);

    try {
        const [existente] = await servidor.query(
            "SHOW DATABASES LIKE 'sistema_bancario_testes'"
        );

        if (existente.length > 0) {
            throw new Error("O banco de testes ja existe. Nenhuma alteracao realizada.");
        }

        console.log("Criando banco de testes...");

        await servidor.query(
            "CREATE DATABASE sistema_bancario_testes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        );

        await servidor.query("USE sistema_bancario_testes");
        await servidor.query("SET FOREIGN_KEY_CHECKS = 0");

        const [tabelas] = await origem.query(
            "SHOW FULL TABLES FROM sistema_bancario WHERE Table_type = 'BASE TABLE'"
        );

        const colunaTabela = Object.keys(tabelas[0]).find(
            coluna => coluna.startsWith("Tables_in_")
        );

        for (const registro of tabelas) {
            const tabela = registro[colunaTabela];
            const nomeSeguro = tabela.replace(/`/g, "``");

            const [estrutura] = await origem.query(
                `SHOW CREATE TABLE \`${nomeSeguro}\``
            );

            await servidor.query(estrutura[0]["Create Table"]);

            console.log("Estrutura criada: " + tabela);
        }

        await servidor.query(
            "INSERT INTO sistema_bancario_testes.banco SELECT * FROM sistema_bancario.banco"
        );

        await servidor.query(
            "INSERT INTO sistema_bancario_testes.agencia SELECT * FROM sistema_bancario.agencia"
        );

        await servidor.query("SET FOREIGN_KEY_CHECKS = 1");

        const [resultado] = await servidor.query(
            "SHOW TABLES FROM sistema_bancario_testes"
        );

        console.log("\nBanco de testes criado!");
        console.log("Total de tabelas: " + resultado.length);
        console.log("Registros de banco e agencia copiados.");

        for (const tabela of ["banco", "agencia"]) {
            const [contagem] = await servidor.query(
                `SELECT COUNT(*) AS total FROM sistema_bancario_testes.\`${tabela}\``
            );
            console.log(`${tabela}: ${contagem[0].total} registro(s)`);
        }

    } finally {
        await origem.end();
        await servidor.end();
    }
}

criarBancoTestes().catch(erro => {
    console.error("\nERRO:", erro.message);
    process.exitCode = 1;
});
