"""Build the self-contained Windows companion; Python standard library only."""
from pathlib import Path
import os
import shutil
import subprocess

source = Path(__file__).resolve().parent
project = source.parent
output = project / "output"
output.mkdir(exist_ok=True)
env = os.environ.copy()
root_text = env.get("CHII_TOOLCHAIN_ROOT")
if root_text:
    root = Path(root_text)
    compiler = [str(root / "usr/bin/mono-sgen"), str(root / "usr/lib/mono/4.5/mcs.exe")]
    env.update(LD_LIBRARY_PATH=str(root / "usr/lib"), MONO_PATH=str(root / "usr/lib/mono/4.5"),
               MONO_GAC_PREFIX=str(root / "usr"), MONO_CFG_DIR=str(root / "etc"))
    references = []
    for name in ["System", "System.Windows.Forms", "System.Drawing", "System.Core", "System.Xml"]:
        references.append("-r:" + str(next((root / "usr/lib/mono/gac" / name).glob("*/*.dll"))))
elif shutil.which("mcs"):
    compiler = [shutil.which("mcs")]
    references = ["-r:" + n for n in ["System.Windows.Forms", "System.Drawing", "System.Core", "System.Xml"]]
elif os.name == "nt":
    compiler = [str(Path(env.get("WINDIR", r"C:\Windows")) / "Microsoft.NET/Framework/v4.0.30319/csc.exe")]
    references = ["-r:" + n + ".dll" for n in ["System.Windows.Forms", "System.Drawing", "System.Core", "System.Xml"]]
else:
    raise SystemExit("Install Mono mcs, or build on Windows with .NET Framework 4.x.")
exe = output / "전주치이카와_2.06.exe"
args = compiler + ["-target:winexe", "-optimize+", "-platform:anycpu", "-out:" + str(exe),
                   "-win32icon:" + str(project / "assets/chiikawa.ico")] + references
for path in sorted((project / "assets").iterdir()):
    if path.suffix != ".ico":
        args.append("-resource:" + str(path) + "," + path.name)
for path in sorted(source.iterdir()):
    if path.suffix in [".cs", ".py", ".txt"]:
        args.append("-resource:" + str(path) + ",source/" + path.name)
args += [str(p) for p in sorted(source.glob("*.cs"))]
subprocess.run(args, env=env, check=True)
print("Built", exe, "bytes", exe.stat().st_size)
