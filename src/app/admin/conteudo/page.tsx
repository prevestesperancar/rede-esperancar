import { getConteudoSite } from "@/lib/queries/admin";
import { ConteudoSiteForm } from "@/components/admin/ConteudoSiteForm";

export default async function AdminConteudoPage() {
  const conteudo = await getConteudoSite();

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Conteúdo do site</h1>
      <p className="text-sm text-ink-soft mb-7">
        Edite o texto público de &ldquo;Quem somos nós&rdquo;, &ldquo;Monitoria&rdquo;, &ldquo;Cotas e permanência&rdquo; e os dados de contato geral da rede.
      </p>
      <ConteudoSiteForm
        quemSomosTexto={conteudo?.quemSomosTexto ?? null}
        contatoEmail={conteudo?.contatoEmail ?? null}
        contatoTelefone={conteudo?.contatoTelefone ?? null}
        contatoEndereco={conteudo?.contatoEndereco ?? null}
        monitoriaTexto={conteudo?.monitoriaTexto ?? null}
        cotasTexto={conteudo?.cotasTexto ?? null}
      />
    </div>
  );
}
