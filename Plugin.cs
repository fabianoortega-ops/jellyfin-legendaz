using System;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Threading.Tasks;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace JellyfinLegendaz
{
    public class Plugin : BasePlugin<PluginConfiguration>
    {
        public static Plugin? Instance { get; private set; }
        private readonly ILogger<Plugin> _logger;

        public Plugin(
            IApplicationPaths applicationPaths,
            IXmlSerializer xmlSerializer,
            ILogger<Plugin> logger)
            : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
            _logger  = logger;
            RegisterWithJavaScriptInjector();
        }

        public override string Name        => "Legendaz";
        public override string Description => "Busca e baixa legendas diretamente do menu do player Jellyfin.";
        public override Guid   Id          => Guid.Parse("d814c265-0396-455b-ba28-397be1d33f13");

        private void RegisterWithJavaScriptInjector()
        {
            _ = Task.Run(async () =>
            {
                const int maxAttempts = 10;
                for (int attempt = 1; attempt <= maxAttempts; attempt++)
                {
                    await Task.Delay(TimeSpan.FromSeconds(attempt * 3)).ConfigureAwait(false);
                    try
                    {
                        var injectorAssembly = FindAssembly("Jellyfin.Plugin.JavaScriptInjector");
                        if (injectorAssembly == null)
                        {
                            _logger.LogInformation("[Legendaz] JavaScript Injector não encontrado.");
                            return;
                        }

                        var iface = injectorAssembly.GetType("Jellyfin.Plugin.JavaScriptInjector.PluginInterface");
                        if (iface == null) { _logger.LogWarning("[Legendaz] PluginInterface não encontrado."); return; }

                        var payload = new JObject
                        {
                            { "id",                     $"{Id}-subtitle-search"   },
                            { "name",                   "Legendaz Subtitle Search" },
                            { "script",                 BuildLoaderScript()        },
                            { "enabled",                true                       },
                            { "requiresAuthentication", true                       },
                            { "pluginId",               Id.ToString()              },
                            { "pluginName",             Name                       },
                            { "pluginVersion",          Version.ToString()         }
                        };

                        var result = iface.GetMethod("RegisterScript")?.Invoke(null, new object[] { payload });
                        if (result is bool ok && ok)
                        {
                            _logger.LogInformation("[Legendaz] Script registrado no JavaScript Injector (tentativa {A}).", attempt);
                            return;
                        }

                        _logger.LogWarning("[Legendaz] RegisterScript retornou falso (tentativa {A}/{M}).", attempt, maxAttempts);
                    }
                    catch (TargetInvocationException ex) when (ex.InnerException is InvalidOperationException)
                    {
                        _logger.LogDebug("[Legendaz] Injector ainda não pronto (tentativa {A}/{M}).", attempt, maxAttempts);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[Legendaz] Erro inesperado (tentativa {A}).", attempt);
                        return;
                    }
                }
            });
        }

        private static Assembly? FindAssembly(string name) =>
            AssemblyLoadContext.All
                .SelectMany(ctx => ctx.Assemblies)
                .FirstOrDefault(a => a.FullName?.Contains(name) ?? false);

        private string BuildLoaderScript() => $@"
// Legendaz — loader
(function () {{
    var s = document.createElement('script');
    s.src = 'https://fabianoortega-ops.github.io/jellyfin-legendaz/legendaz.js?v={Version}';
    s.onerror = function() {{ console.warn('[Legendaz] Falha ao carregar script remoto.'); }};
    document.head.appendChild(s);
}}());
";
    }
}
