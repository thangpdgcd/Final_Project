import{c as n}from"./index-D1Iqy3-1.js";import{o as h,r}from"./antd-5LhTy3za.js";/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]],g=n("package",l),y=()=>{const{message:a}=h.useApp(),[c,o]=r.useState([]);return r.useEffect(()=>{try{const t=localStorage.getItem("coffephan_wishlist");t&&o(JSON.parse(t))}catch(t){console.error("Failed to parse wishlist",t)}},[]),{wishlist:c,addToWishlist:t=>{o(s=>{if(s.find(i=>i.product_ID===t.product_ID))return a.info("Sản phẩm đã có trong danh sách yêu thích!"),s;const e=[...s,t];return localStorage.setItem("coffephan_wishlist",JSON.stringify(e)),a.success("Đã thêm vào danh sách yêu thích!"),e})},removeFromWishlist:t=>{o(s=>{const e=s.filter(i=>i.product_ID!==t);return localStorage.setItem("coffephan_wishlist",JSON.stringify(e)),e})},isInWishlist:t=>c.some(s=>s.product_ID===t)}};export{g as P,y as u};
//# sourceMappingURL=useWishlist-Bi5thmoq.js.map
