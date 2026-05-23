import Link from "next/link";
import { Reveal } from "./Reveal";

/**
 * Combined closing editorial block that fuses the "About 晨瀚宇" intro
 * and the "Featured · Research Program" Parallax pitch into one
 * narrative — anthropic.com Project Glasswing pattern. The visitor
 * meets the author and the author's program in one continuous read,
 * after they've already seen the toolkit and reading material.
 */
export function AboutParallaxBlock() {
  return (
    <section className="border-t border-rule">
      <div className="mx-auto max-w-[88rem] px-6 py-28 sm:py-36">
        <div className="grid grid-cols-12 gap-x-12 gap-y-16">
          {/* About column */}
          <div className="col-span-12 md:col-span-5">
            <Reveal>
              <p className="eyebrow text-ink-subtle">About</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-serif text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-ink">
                我是晨瀚宇
              </h2>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 space-y-5 font-fluid-body leading-[1.85] text-ink">
                <p>
                  研究方法在人格、会计、医学、教育与公共卫生五个领域的交汇处。关心的是方法本身的边界——什么样的研究对象本来不能做随机化实验，把哪几个观测视角并联起来可以重新可解。
                </p>
                <p>
                  近两年这套工作方式在十份数据上演练过：王阳明、苏轼、曾国藩、顾炎武四位历史人物的全集语料，Bao 等人 2020 年公开复制包与 Compustat 面板，Connors 等人 1996 年发表的右心导管数据，Tennessee STAR 班额实验，BCG 疫苗 13 项试验合并样本。
                </p>
              </div>
            </Reveal>
          </div>

          {/* Parallax program column */}
          <div className="col-span-12 md:col-span-7 md:pl-6">
            <Reveal>
              <p className="eyebrow text-ink-subtle">
                Featured · Research Program
              </p>
            </Reveal>
            <div className="mt-6 flex items-baseline gap-5">
              <Reveal delay={80}>
                <h3 className="font-serif text-[clamp(3rem,7vw,5.5rem)] leading-[1.02] tracking-[-0.028em] text-ink">
                  视差
                </h3>
              </Reveal>
              <Reveal delay={200}>
                <p className="font-serif italic text-[clamp(1rem,1.3vw,1.35rem)] text-ink-muted">
                  Parallax
                </p>
              </Reveal>
            </div>
            <Reveal delay={320}>
              <p className="mt-8 max-w-2xl font-fluid-lede leading-[1.7] text-ink">
                用最新的大模型从不同观测视角去做以前做不了的研究。苏轼作品里的情感变化、长时段日记里的态度漂移、临床记录里的隐性混杂——以前难以触达的维度，现在多视角并联起来可读。
              </p>
            </Reveal>
            <Reveal delay={440}>
              <Link
                href="/research"
                className="group mt-10 inline-flex items-baseline gap-2 eyebrow text-ember transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
              >
                Read the program{" "}
                <span aria-hidden="true" className="link-arrow">
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
