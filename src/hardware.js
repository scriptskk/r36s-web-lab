/** Target reference hardware. Values describe a standard RK3326 R36S, not a virtual machine. */
export const R36S_REFERENCE = Object.freeze({
  revision: "RK3326 / reference",
  cpu: Object.freeze({soc:"Rockchip RK3326",architecture:"ARMv8-A Cortex-A35",cores:4,maxMHz:1500}),
  gpu: Object.freeze({name:"Mali-G31 MP2",execution:"unavailable"}),
  ram: Object.freeze({installedMiB:1024,technology:"DDR3L",enforced:false}),
  display: Object.freeze({diagonalInches:3.5,width:640,height:480,aspect:"4:3",technology:"IPS"}),
  storage: Object.freeze({microSDSlots:2}),
  connectivity: Object.freeze({wifiIntegrated:false,bluetoothIntegrated:false,videoOut:false}),
  // Chassis dimensions vary by revisions and sources. Do not remesh third-party assets.
  chassis: Object.freeze({referenceHeightMm:130,referenceWidthMm:83,referenceDepthMm:35,calibrated:false}),
  runtime: Object.freeze({arkosBoot:false,armExecution:false,gpuVirtualization:false})
});
export function aspectRatio(width,height) {
  if (!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0) throw new Error("Resolução inválida");
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const d=gcd(width,height);
  return (width/d)+":"+(height/d);
}
export function validateReference(profile=R36S_REFERENCE) {
  return profile.display.width===640 && profile.display.height===480 &&
    aspectRatio(profile.display.width,profile.display.height)==="4:3" &&
    profile.ram.installedMiB===1024 && profile.cpu.cores===4;
}
