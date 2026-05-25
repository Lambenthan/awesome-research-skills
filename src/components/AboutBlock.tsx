import { Reveal } from "./Reveal";

/**
 * Single-column closing editorial block — author self-introduction.
 *
 * After the 10-book "我的研究兴趣" list above, this block lets the
 * visitor meet the person behind the work in their own voice. The
 * Parallax research-program pitch lives on its dedicated /research
 * page; surfacing it on the homepage twice (here and again in the
 * Notes list) read as redundant.
 */
export function AboutBlock() {
  return (
    <section className="border-t border-rule">
      <div className="mx-auto max-w-3xl px-6 py-28 sm:py-36">
        <Reveal>
          <p className="eyebrow text-ink-subtle">About</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-6 font-serif text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-ink">
            我是晨瀚宇
          </h2>
        </Reveal>
        <Reveal delay={220}>
          <div className="mt-8 space-y-5 font-fluid-body leading-[1.9] text-ink">
            <p>
              研究方法在人格、会计、医学、教育与公共卫生五个领域的交汇处。关心的是方法本身的边界——什么样的研究对象本来不能做随机化实验，把哪几个观测视角并联起来可以重新可解。
            </p>
            <p>
              近两年这套工作方式在十份数据上演练过：王阳明、苏轼、曾国藩、顾炎武四位历史人物的全集语料，Bao 等人 2020 年公开复制包与 Compustat 面板，Connors 等人 1996 年发表的右心导管数据，Tennessee STAR 班额实验，BCG 疫苗 13 项试验合并样本。
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
