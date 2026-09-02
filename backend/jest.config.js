module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Sin `roots`, jest rastrea todo el proyecto (node_modules incluido) y, tras
    // un `npm run build`, contaría cada test dos veces: el .ts de src y el .js
    // compilado en dist.
    roots: ['<rootDir>/src'],
    // Imprescindible: si watchman está instalado pero su daemon no responde,
    // jest se queda colgado sin imprimir nada y luego muere con un 'error' sin
    // manejar de fb-watchman. Su propio crawler es de sobra para este repo.
    watchman: false,
  };