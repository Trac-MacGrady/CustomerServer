/**
 * Desc: 表情包数据源
 *
 * Created by WangGanxin on 2018/1/31
 * Email: mail@wangganxin.me
 */

//符号(固定长度5，且唯一)->图片路径
export const EMOTIONS_DATA = {
  '[):]': require('./emotions/e_e_1.png'), /* 微笑 */
  '[:D]': require('./emotions/e_e_2.png'), /* 撇嘴 */
  '[;)]': require('./emotions/e_e_3.png'), /* 色 */
  '[:-o]': require('./emotions/e_e_4.png'), /* 发呆 */
  '[:p]': require('./emotions/e_e_5.png'), /* 得意 */
  '[(H)]': require('./emotions/e_e_6.png'), /* 流泪 */
  '[:@]': require('./emotions/e_e_7.png'), /* 害羞 */
  '[:s]': require('./emotions/e_e_8.png'), /* 闭嘴 */
  '[:$]': require('./emotions/e_e_9.png'), /* 睡 */
  '[:(]': require('./emotions/e_e_10.png'), /* 大哭 */
  '[:\'(]': require('./emotions/e_e_11.png'), /* 尴尬 */
  '[:|]': require('./emotions/e_e_12.png'), /* 发怒 */
  '[(a)]': require('./emotions/e_e_13.png'), /* 调皮 */
  '[8o|]': require('./emotions/e_e_14.png'), /* 龇牙 */
  '[8-|]': require('./emotions/e_e_15.png'), /* 惊讶 */
  '[+o(]': require('./emotions/e_e_16.png'), /* 囧 */
  '[<o)]': require('./emotions/e_e_17.png'), /* 难过 */
  '[|-)]': require('./emotions/e_e_18.png'), /* 抓狂 */
  '[*-)]': require('./emotions/e_e_19.png'), /* 吐 */
  '[:-#]': require('./emotions/e_e_20.png'), /* 发笑 */

  '[:-*]': require('./emotions/e_e_21.png'), /* 愉快 */
  '[^o)]': require('./emotions/e_e_22.png'), /* 白眼 */
  '[8-)]': require('./emotions/e_e_23.png'), /* 傲慢 */
  '[(|)]': require('./emotions/e_e_24.png'), /* 困 */
  '[(u)]': require('./emotions/e_e_25.png'), /* 惊恐 */
  '[(S)]': require('./emotions/e_e_26.png'), /* 流汗 */
  '[(*)]': require('./emotions/e_e_27.png'), /* 憨笑 */
  '[(#)]': require('./emotions/e_e_28.png'), /* 悠闲 */
  '[(R)]': require('./emotions/e_e_29.png'), /* 奋斗 */
  '[({)]': require('./emotions/e_e_30.png'), /* 咒骂 */
  '[(})]': require('./emotions/e_e_31.png'), /* 疑问 */
  '[(k)]': require('./emotions/e_e_32.png'), /* 嘘 */
  '[(F)]': require('./emotions/e_e_33.png'), /* 晕 */
  '[(W)]': require('./emotions/e_e_34.png'), /* 衰 */
  '[(D)]': require('./emotions/e_e_35.png'), /* 骷髅 */

};

//符号->中文
export const EMOTIONS_ZHCN = {

  '[):]':'[微笑]',
  '[:D]': '[高兴]',
  '[;)]':'[调皮]',
  '[:-o]': '[流汗]',
  '[:p]': '[可爱]',
  '[(H)]': '[酷]',
  '[:@]': '[发怒]',
  '[:s]': '[撇嘴]',
  '[:$]': '[委屈]',
  '[:(]':'[难过]',
  '[:\'(]': '[大哭]',
  '[:|]':'[尴尬]',
  '[(a)]': '[大笑]',
  '[8o|]': '[坏笑]',
  '[8-|]': '[呲牙]',
  '[+o(]': '[吐]',
  '[<o)]': '[困]',
  '[|-)]': '[晕]',
  '[*-)]': '[傲慢]',
  '[:-#]': '[闭嘴]',

  '[:-*]': '[偷笑]',
  '[^o)]': '[白眼]',
  '[8-)]': '[发呆]',
  '[(|)]': '[心]',
  '[(u)]': '[心碎]',
  '[(S)]': '[月亮]',
  '[(*)]': '[星星]',
  '[(#)]': '[太阳]',
  '[(R)]': '[彩虹]',
  '[({)]': '[色]',
  '[(})]': '[亲亲]',
  '[(k)]': '[嘴唇]',
  '[(F)]': '[玫瑰]',
  '[(W)]': '[凋谢]',
  '[(D)]': '[强]',
};

//反转对象的键值
export const invertKeyValues = obj =>
  Object.keys(obj).reduce((acc, key) => {
    acc[obj[key]] = key;
    return acc;
  }, {});

