/**
 * 基于订单维度的评价提交
 *
 * @url /order/addOrderComment.do
 * 
 * 入参：orderId，serviceCommentStr， skuIdsCommentStr
 * 其中serviceCommentStr为服务评价内容，样式为：id1:score1;id2:score2。其中id为每项服务的id，score为该项服务得分，不同项之间以“;”分隔，同一项内以“:”分隔；
 */

module.exports = function (req) {
  return {
    success: Math.random() < 0.5 ? false : true,
    msg: '@word',
    skuId: "500001488",
    code: Math.random() < 0.5 ? -200 : 0,
  };
}
