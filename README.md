# Monitoramento dos reservatórios do semi-árido brasileiro

## Desenvolvimento

### Requisitos

É necessária a instalação do [nodeJS](https://nodejs.org/) com o seu gerenciador de pacotes [npm](https://www.npmjs.com/). Como este projeto usa [Sass](http://sass-lang.com/) como pre-processador CSS, também é necessário do [compass](http://compass-style.org/):

```
sudo apt-get install nodejs
sudo apt-get install npm
# O comando abaixo só é necessário quando o comando <node> não é encontrado
sudo ln -s /usr/bin/nodejs /usr/bin/node

sudo apt-get install ruby-full
sudo gem update --system
sudo gem install compass
```

Também é necessário o **grunt-cli** e **bower** instalados no ambiente:

```
sudo npm install -g grunt-cli bower
```

Por fim, para instalar as dependencias do projeto, utiliza-se o **npm** e o **bower**.
```
cd <caminho_do_projeto>
npm install
bower install
```

### Rodando

Para rodar o preview da aplicação, use o comando `grunt serve`.

## Deployment

O 'grunt build' tem um parâmetro para definir o environment.

Use `grunt build` para gerar a versão de produção na pasta **dist**.

Para subir a aplicação para o servidor final, configure o arquivo `secret.json` na raiz do projeto e execute:

```
grunt build --env=prod
grunt ssh_deploy:prod
```

É possível desfazer o deployment retornando para a versão anterior do projeto:

```
grunt ssh_rollback:prod
```

## Arquivo secret.json

Exemplo do arquivo `secret.json` que deve conter as credenciais de acesso ao servidor de produção:

```
{
  "development": {
    "host": "http://localhost",
    "username": "meuusuario",
    "password": "MiNhaSeNhA",
    "port": "22",
    "deploy_path": "/var/www/html/"
  },
  "production": {
    "host": "10.x.x.xxx",
    "username": "systemusername",
    "password": "userpassword",
    "port": "22",
    "deploy_path": "/var/www/"
  }
}
```
