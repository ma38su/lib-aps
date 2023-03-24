async function sleep(msec: number) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), msec));
}

export { sleep }