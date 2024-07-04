import{_ as s,c as a,o as i,a4 as n}from"./chunks/framework.CC18aqI2.js";const F=JSON.parse('{"title":"打包","description":"","frontmatter":{},"headers":[],"relativePath":"guide/basic/guide-build.md","filePath":"guide/basic/guide-build.md","lastUpdated":1719991187000}'),e={name:"guide/basic/guide-build.md"},l=n(`<h1 id="打包" tabindex="-1">打包 <a class="header-anchor" href="#打包" aria-label="Permalink to &quot;打包&quot;">​</a></h1><h2 id="打包命令" tabindex="-1">打包命令 <a class="header-anchor" href="#打包命令" aria-label="Permalink to &quot;打包命令&quot;">​</a></h2><h3 id="本地环境打包预览" tabindex="-1">本地环境打包预览 <a class="header-anchor" href="#本地环境打包预览" aria-label="Permalink to &quot;本地环境打包预览&quot;">​</a></h3><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> preview:build</span></span></code></pre></div><h3 id="测试环境打包" tabindex="-1">测试环境打包 <a class="header-anchor" href="#测试环境打包" aria-label="Permalink to &quot;测试环境打包&quot;">​</a></h3><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build:test</span></span></code></pre></div><h3 id="正式环境打包" tabindex="-1">正式环境打包 <a class="header-anchor" href="#正式环境打包" aria-label="Permalink to &quot;正式环境打包&quot;">​</a></h3><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># or</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build:prod</span></span></code></pre></div><h3 id="打包分析" tabindex="-1">打包分析 <a class="header-anchor" href="#打包分析" aria-label="Permalink to &quot;打包分析&quot;">​</a></h3><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> report</span></span></code></pre></div><h2 id="打包压缩" tabindex="-1">打包压缩 <a class="header-anchor" href="#打包压缩" aria-label="Permalink to &quot;打包压缩&quot;">​</a></h2><p>Admin 内置打包压缩功能，可以对打包后的静态文件进行 <code>gizp</code>、<code>brotli</code> 压缩，压缩后部署到 <code>nginx</code> 将极大提高网页加载速度。</p><p>首先在 <code>.env</code> 文件提供了 <code>VITE_BUILD_GZIP</code> 属性，用来配置是否开启 gzip 压缩。</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 是否开启 gzip 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_BUILD_GZIP</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span></code></pre></div><p>然后在 <code>.env.test</code> 和 <code>.env.production</code> 文件里提供了 <code>VITE_COMPRESSION</code> 配置。</p><p>压缩支持：</p><ul><li>压缩时不删除原始文件的配置</li><li>压缩时删除原始文件的配置</li></ul><h4 id="压缩时不删除原始文件的配置" tabindex="-1">压缩时不删除原始文件的配置 <a class="header-anchor" href="#压缩时不删除原始文件的配置" aria-label="Permalink to &quot;压缩时不删除原始文件的配置&quot;">​</a></h4><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 开启 gzip 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;gzip&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 开启 brotli 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;brotli&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 同时开启 gzip 与 brotli 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;both&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 不开启压缩，默认</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;none&quot;</span></span></code></pre></div><h4 id="时删除原始文件的配置" tabindex="-1">时删除原始文件的配置 <a class="header-anchor" href="#时删除原始文件的配置" aria-label="Permalink to &quot;时删除原始文件的配置&quot;">​</a></h4><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 开启 gzip 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;gzip-clear&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 开启 brotli 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;brotli-clear&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 同时开启 gzip 与 brotli 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;both-clear&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 不开启压缩，默认</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_COMPRESSION</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;none&quot;</span></span></code></pre></div><h2 id="打包内容" tabindex="-1">打包内容 <a class="header-anchor" href="#打包内容" aria-label="Permalink to &quot;打包内容&quot;">​</a></h2><p>Admin 使用 <code>esbuild</code> 和 <code>rollup</code> 进行构建，同时在 <code>.env</code> 文件客针对打包内容进行配置：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 是否生成包分析文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_REPORT</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 是否开启 gzip 压缩</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_BUILD_GZIP</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 是否删除生产环境 console</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">VITE_DROP_CONSOLE</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span></code></pre></div><p>同时使用了 <code>output</code> 对静态资源进行分类打包，最终得到的打包文件是：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dist</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">├─ static</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">│  ├─css</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">│  ├─js</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">│  ├─png</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">│  └─svg</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">│─ favicon.ico</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">│─ index.html</span></span></code></pre></div><p>同时 Admin 使用 <a href="http://postcss.org/" target="_blank" rel="noreferrer">postcss</a> 压缩 css，使用 Autoprefixer 自动添加浏览器前缀。</p>`,27),t=[l];function p(h,k,d,o,r,c){return i(),a("div",null,t)}const u=s(e,[["render",p]]);export{F as __pageData,u as default};