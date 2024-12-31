const logoText = "RepoAI"

const msgText = (msg: string) => `\n${' '.repeat(14 - msg.length / 2)}[${msg}]`

export const contentScriptLog = (item: string) => {
  console.log(logoText, msgText(`${item} Script Loaded`))
}

export const backgroundLog = () => {
  console.log(logoText, msgText('Background Loaded'))
}
