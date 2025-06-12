{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    playwright-driver.browsers
  ];

  shellHook = ''
    			export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
          export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
          export PLAYWRIGHT_NODEJS_PATH="${pkgs.nodejs}/bin/node"
          export PLAYWRIGHT_DRIVER_PATH="${pkgs.playwright-driver}"
  '';
}
