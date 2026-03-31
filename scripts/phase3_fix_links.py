"""Phase 3: fix documentation links after localized renames."""
from __future__ import annotations
import os
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
GLOBAL_REPL = [
    ("docs/en/user/manual_clientes.md", "docs/en/user/manual-customers.md"),
    ("../en/user/manual_clientes.md", "../en/user/manual-customers.md"),
    ("../../en/user/manual_clientes.md", "../../en/user/manual-customers.md"),
    ("docs/en/THEMING.md", "docs/en/theming.md"),
    ("docs/en/ARCHITECTURE.md", "docs/en/architecture.md"),
    ("docs/en/ACCESSIBILITY.md", "docs/en/accessibility.md"),
    ("docs/en/SECURITY.md", "docs/en/security.md"),
    ("docs/en/GLOSSARY.md", "docs/en/glossary.md"),
    ("docs/en/CHANGELOG.md", "docs/en/changelog.md"),
    ("docs/en/CODING_STANDARDS.md", "docs/en/coding-standards.md"),
    ("docs/en/I18N_STRATEGY.md", "docs/en/i18n-strategy.md"),
    ("docs/en/PRIVACY_DATA_MAP.md", "docs/en/privacy-data-map.md"),
    ("../../en/THEMING.md", "../../en/theming.md"),
    ("../../en/ARCHITECTURE.md", "../../en/architecture.md"),
    ("../../en/CODING_STANDARDS.md", "../../en/coding-standards.md"),
    ("../../en/ACCESSIBILITY.md", "../../en/accessibility.md"),
    ("../../en/SECURITY.md", "../../en/security.md"),
    ("../../en/GLOSSARY.md", "../../en/glossary.md"),
    ("../../en/CHANGELOG.md", "../../en/changelog.md"),
    ("../../en/I18N_STRATEGY.md", "../../en/i18n-strategy.md"),
    ("../../en/PRIVACY_DATA_MAP.md", "../../en/privacy-data-map.md"),
    ("../../en/quality/ISO_TRACEABILITY.md", "../../en/quality/iso-traceability.md"),
    ("../../en/quality/TESTING_STRATEGY.md", "../../en/quality/testing-strategy.md"),
    ("../../en/quality/CI_CD.md", "../../en/quality/ci-cd.md"),
    ("../../en/quality/QUALITY_MANUAL.md", "../../en/quality/quality-manual.md"),
    ("../../en/quality/RECORDS_TEMPLATE.md", "../../en/quality/records-template.md"),
    ("../../es/THEMING.md", "../../es/temas-interfaz.md"),
    ("../../es/ARCHITECTURE.md", "../../es/arquitectura.md"),
    ("../../es/CODING_STANDARDS.md", "../../es/estandares-codigo.md"),
    ("../../es/I18N_STRATEGY.md", "../../es/estrategia-i18n.md"),
    ("../../es/PRIVACY_DATA_MAP.md", "../../es/mapa-datos-personales.md"),
    ("../../es/GLOSSARY.md", "../../es/glosario.md"),
    ("../../es/CHANGELOG.md", "../../es/historial-de-cambios.md"),
    ("../../es/SECURITY.md", "../../es/seguridad.md"),
    ("../../es/ACCESSIBILITY.md", "../../es/accesibilidad.md"),
    ("../../es/quality/ISO_TRACEABILITY.md", "../../es/quality/trazabilidad-iso.md"),
    ("../../es/quality/TESTING_STRATEGY.md", "../../es/quality/estrategia-pruebas.md"),
    ("../../es/quality/CI_CD.md", "../../es/quality/ciclo-ci-cd.md"),
    ("../../es/quality/QUALITY_MANUAL.md", "../../es/quality/manual-calidad.md"),
    ("../../es/quality/RECORDS_TEMPLATE.md", "../../es/quality/plantillas-registros.md"),
    ("../../pt-br/THEMING.md", "../../pt-br/temas-interface.md"),
    ("../../pt-br/ARCHITECTURE.md", "../../pt-br/arquitetura.md"),
    ("../../pt-br/CODING_STANDARDS.md", "../../pt-br/padroes-codigo.md"),
    ("../../pt-br/I18N_STRATEGY.md", "../../pt-br/estrategia-i18n.md"),
    ("../../pt-br/PRIVACY_DATA_MAP.md", "../../pt-br/mapa-dados-pessoais.md"),
    ("../../pt-br/GLOSSARY.md", "../../pt-br/glossario.md"),
    ("../../pt-br/CHANGELOG.md", "../../pt-br/historico-de-alteracoes.md"),
    ("../../pt-br/SECURITY.md", "../../pt-br/seguranca.md"),
    ("../../pt-br/ACCESSIBILITY.md", "../../pt-br/acessibilidade.md"),
    ("../../pt-br/quality/ISO_TRACEABILITY.md", "../../pt-br/quality/rastreabilidade-iso.md"),
    ("../../pt-br/quality/TESTING_STRATEGY.md", "../../pt-br/quality/estrategia-testes.md"),
    ("../../pt-br/quality/CI_CD.md", "../../pt-br/quality/ciclo-ci-cd.md"),
    ("../../pt-br/quality/QUALITY_MANUAL.md", "../../pt-br/quality/manual-qualidade.md"),
    ("../../pt-br/quality/RECORDS_TEMPLATE.md", "../../pt-br/quality/modelos-registros.md"),
    ("../en/specs/README.md", "../en/specs/index.md"),
    ("../es/specs/README.md", "../es/specs/indice.md"),
    ("../pt-br/specs/README.md", "../pt-br/specs/indice.md"),
    ("docs/en/specs/README.md", "docs/en/specs/index.md"),
    ("docs/es/specs/README.md", "docs/es/specs/indice.md"),
    ("docs/pt-br/specs/README.md", "docs/pt-br/specs/indice.md"),
]

def locale_map(prefix):
    if prefix == "en":
        return [
            ("THEMING.md", "theming.md"), ("ARCHITECTURE.md", "architecture.md"),
            ("CODING_STANDARDS.md", "coding-standards.md"), ("I18N_STRATEGY.md", "i18n-strategy.md"),
            ("PRIVACY_DATA_MAP.md", "privacy-data-map.md"), ("GLOSSARY.md", "glossary.md"),
            ("CHANGELOG.md", "changelog.md"), ("SECURITY.md", "security.md"),
            ("ACCESSIBILITY.md", "accessibility.md"), ("ISO_TRACEABILITY.md", "iso-traceability.md"),
            ("CI_CD.md", "ci-cd.md"), ("QUALITY_MANUAL.md", "quality-manual.md"),
            ("RECORDS_TEMPLATE.md", "records-template.md"), ("TESTING_STRATEGY.md", "testing-strategy.md"),
        ]
    if prefix == "es":
        return [
            ("THEMING.md", "temas-interfaz.md"), ("ARCHITECTURE.md", "arquitectura.md"),
            ("CODING_STANDARDS.md", "estandares-codigo.md"), ("I18N_STRATEGY.md", "estrategia-i18n.md"),
            ("PRIVACY_DATA_MAP.md", "mapa-datos-personales.md"), ("GLOSSARY.md", "glosario.md"),
            ("CHANGELOG.md", "historial-de-cambios.md"), ("SECURITY.md", "seguridad.md"),
            ("ACCESSIBILITY.md", "accesibilidad.md"), ("ISO_TRACEABILITY.md", "trazabilidad-iso.md"),
            ("CI_CD.md", "ciclo-ci-cd.md"), ("QUALITY_MANUAL.md", "manual-calidad.md"),
            ("RECORDS_TEMPLATE.md", "plantillas-registros.md"), ("TESTING_STRATEGY.md", "estrategia-pruebas.md"),
        ]
    if prefix == "pt-br":
        return [
            ("THEMING.md", "temas-interface.md"), ("ARCHITECTURE.md", "arquitetura.md"),
            ("CODING_STANDARDS.md", "padroes-codigo.md"), ("I18N_STRATEGY.md", "estrategia-i18n.md"),
            ("PRIVACY_DATA_MAP.md", "mapa-dados-pessoais.md"), ("GLOSSARY.md", "glossario.md"),
            ("CHANGELOG.md", "historico-de-alteracoes.md"), ("SECURITY.md", "seguranca.md"),
            ("ACCESSIBILITY.md", "acessibilidade.md"), ("ISO_TRACEABILITY.md", "rastreabilidade-iso.md"),
            ("CI_CD.md", "ciclo-ci-cd.md"), ("QUALITY_MANUAL.md", "manual-qualidade.md"),
            ("RECORDS_TEMPLATE.md", "modelos-registros.md"), ("TESTING_STRATEGY.md", "estrategia-testes.md"),
        ]
    return []

STUB_REPL = [
    ("(en/THEMING.md)", "(en/theming.md)"), ("(es/THEMING.md)", "(es/temas-interfaz.md)"),
    ("(pt-br/THEMING.md)", "(pt-br/temas-interface.md)"),
    ("(en/ARCHITECTURE.md)", "(en/architecture.md)"), ("(es/ARCHITECTURE.md)", "(es/arquitectura.md)"),
    ("(pt-br/ARCHITECTURE.md)", "(pt-br/arquitetura.md)"),
    ("(en/CODING_STANDARDS.md)", "(en/coding-standards.md)"), ("(es/CODING_STANDARDS.md)", "(es/estandares-codigo.md)"),
    ("(pt-br/CODING_STANDARDS.md)", "(pt-br/padroes-codigo.md)"),
    ("(en/I18N_STRATEGY.md)", "(en/i18n-strategy.md)"), ("(es/I18N_STRATEGY.md)", "(es/estrategia-i18n.md)"),
    ("(pt-br/I18N_STRATEGY.md)", "(pt-br/estrategia-i18n.md)"),
    ("(en/PRIVACY_DATA_MAP.md)", "(en/privacy-data-map.md)"), ("(es/PRIVACY_DATA_MAP.md)", "(es/mapa-datos-personales.md)"),
    ("(pt-br/PRIVACY_DATA_MAP.md)", "(pt-br/mapa-dados-pessoais.md)"),
    ("../en/quality/TESTING_STRATEGY.md", "../en/quality/testing-strategy.md"),
    ("../es/quality/TESTING_STRATEGY.md", "../es/quality/estrategia-pruebas.md"),
    ("../pt-br/quality/TESTING_STRATEGY.md", "../pt-br/quality/estrategia-testes.md"),
    ("../en/quality/RECORDS_TEMPLATE.md", "../en/quality/records-template.md"),
    ("../es/quality/RECORDS_TEMPLATE.md", "../es/quality/plantillas-registros.md"),
    ("../pt-br/quality/RECORDS_TEMPLATE.md", "../pt-br/quality/modelos-registros.md"),
    ("../en/quality/QUALITY_MANUAL.md", "../en/quality/quality-manual.md"),
    ("../es/quality/QUALITY_MANUAL.md", "../es/quality/manual-calidad.md"),
    ("../pt-br/quality/QUALITY_MANUAL.md", "../pt-br/quality/manual-qualidade.md"),
    ("../en/quality/ISO_TRACEABILITY.md", "../en/quality/iso-traceability.md"),
    ("../es/quality/ISO_TRACEABILITY.md", "../es/quality/trazabilidad-iso.md"),
    ("../pt-br/quality/ISO_TRACEABILITY.md", "../pt-br/quality/rastreabilidade-iso.md"),
    ("../en/quality/CI_CD.md", "../en/quality/ci-cd.md"),
    ("../es/quality/CI_CD.md", "../es/quality/ciclo-ci-cd.md"),
    ("../pt-br/quality/CI_CD.md", "../pt-br/quality/ciclo-ci-cd.md"),
]


def apply_ordered(subs, text):
    subs = sorted(subs, key=lambda x: len(x[0]), reverse=True)
    for a, b in subs:
        text = text.replace(a, b)
    return text


def process_file(path):
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError:
        return False
    rp = path.relative_to(ROOT).as_posix()
    subs = list(GLOBAL_REPL)
    if rp.startswith("docs/en/"):
        subs.extend(locale_map("en"))
    elif rp.startswith("docs/es/"):
        subs.extend(locale_map("es"))
    elif rp.startswith("docs/pt-br/"):
        subs.extend(locale_map("pt-br"))
    elif rp.startswith("docs/") and rp.count("/") == 1:
        subs.extend(STUB_REPL)
    out = apply_ordered(subs, raw)
    if out != raw:
        path.write_text(out, encoding="utf-8", newline="\n")
        return True
    return False


def main():
    n = 0
    for dirpath, _, filenames in os.walk(ROOT):
        if ".git" in dirpath or "node_modules" in dirpath:
            continue
        for fn in filenames:
            if not fn.endswith((".md", ".mdc")):
                continue
            p = Path(dirpath) / fn
            if process_file(p):
                print("patched", p.relative_to(ROOT))
                n += 1
    print("files patched:", n)


if __name__ == "__main__":
    main()
