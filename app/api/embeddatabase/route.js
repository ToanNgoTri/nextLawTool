import { MongoClient } from "mongodb"

const client = new MongoClient(
  "mongodb://thuvienphapluat:ZvQn9683p8NnPXFMdR1VX53HTK3Da1WqyXJpvtgMMASTRdDkyu87lFAL7aR5DiiN@46.225.145.42:6980/?directConnection=true"
)

async function embed(text) {

  const res = await fetch(
    "http://localhost:11434/api/embed",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "bge-m3",
        prompt: text
      })
    }
  )

  const data = await res.json()

  return data.embedding
}

export async function GET() {

  await client.connect()

//   const db = client.db("LawMachine")

//   const laws = db.collection("LawCollection")

  // document gốc của bạn
  const document = {
  "_id": "14/2024/TT-BVHTTDL",
  "info": {
    "lawDescription": "Thông tư 14/2024/TT-BVHTTDL của Bộ Văn hóa, Thể thao và Du lịch quy định việc hạn chế sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh, sân khấu",
    "lawNumber": "14/2024/TT-BVHTTDL",
    "unitPublish": [
      "Bộ Văn hóa, Thể thao và Du lịch"
    ],
    "lawKind": "Thông tư",
    "lawDaySign": "2024-11-26T17:00:00.000Z",
    "lawDayActive": "2025-01-24T17:00:00.000Z",
    "lawNameDisplay": "Thông tư số 14/2024/TT-BVHTTDL",
    "lawRelated": {
      "144/2020/NĐ-CP": "Nghị định 144/2020/NĐ-CP của Chính phủ quy định về hoạt động nghệ thuật biểu diễn",
      "01/2023/NĐ-CP": "Nghị định 01/2023/NĐ-CP của Chính phủ về việc quy định chức năng, nhiệm vụ, quyền hạn và cơ cấu tổ chức của Bộ Văn hóa, Thể thao và Du lịch",
      "05/2023/TT-BVHTTDL": "Thông tư 05/2023/TT-BVHTTDL của Bộ Văn hóa, Thể thao và Du lịch quy định tiêu chí phân loại phim và thực hiện hiển thị mức phân loại phim, cảnh báo",
      "25/2018/TT-BVHTTDL": "Thông tư 25/2018/TT-BVHTTDL của Bộ Văn hóa, Thể thao và Du lịch về việc quy định hạn chế hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm sân khấu, điện ảnh",
      "09/2012/QH13": "Luật Phòng, chống tác hại của thuốc lá năm 2012",
      "05/2022/QH15": "Luật Điện ảnh năm 2022"
    },
    "nameSign": [
      "Nguyễn Văn Hùng"
    ],
    "roleSign": [
      "Bộ trưởng"
    ]
  },
  "content": [
    {
      "Điều 1: Phạm vi điều chỉnh": "Thông tư này quy định việc hạn chế sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh, sân khấu và trách nhiệm của các tổ chức, cá nhân có liên quan."
    },
    {
      "Điều 2: Đối tượng áp dụng": "1. Tổ chức, cá nhân tổ chức biểu diễn nghệ thuật.\n2. Tổ chức, cá nhân sản xuất phim, phát hành phim, phổ biến phim, phân loại phim.\n3. Diễn viên tham gia trong tác phẩm điện ảnh, biểu diễn nghệ thuật.\n4. Tổ chức, cá nhân khác liên quan trong tác phẩm điện ảnh, sân khấu."
    },
    {
      "Điều 3: Nguyên tắc hạn chế sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh, sân khấu": "1. Không sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh, sân khấu, trừ trường hợp quy định tại khoản 2 và khoản 3 Điều này.\n2. Việc sử dụng hình ảnh diễn viên sử dụng thuốc lá nhằm phê phán, lên án các hành vi bị nghiêm cấm quy định tại Điều 9 và hành vi vi phạm nghĩa vụ của người hút thuốc lá quy định tại Điều 13 của Luật Phòng, chống tác hại của thuốc lá.\n3. Việc sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh, sân khấu nhằm mục đích nghệ thuật thực hiện theo quy định tại Điều 4 và Điều 5 Thông tư này."
    },
    {
      "Điều 4: Sử dụng hình ảnh diễn viên sử dụng thuốc lá trong sân khấu nhằm mục đích nghệ thuật": "1. Sử dụng hình ảnh diễn viên sử dụng thuốc lá nhằm mục đích nghệ thuật trong sân khấu bao gồm:\na) Khắc họa hình tượng nhân vật lịch sử có thật;\nb) Tái hiện một giai đoạn lịch sử nhất định;\nc) Phê phán, lên án hành vi sử dụng thuốc lá.\n2. Khi sử dụng thuốc lá nhằm mục đích nghệ thuật, diễn viên không thực hiện hành vi hút thuốc thật trên sân khấu."
    },
    {
      "Điều 5: Sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh nhằm mục đích nghệ thuật": "1. Sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh nhằm mục đích nghệ thuật bao gồm:\na) Các trường hợp quy định tại các điểm a, b và c khoản 1 Điều 4 Thông tư này;\nb) Các trường hợp khác được cơ quan nhà nước có thẩm quyền quyết định trên cơ sở đề nghị của Hội đồng thẩm định, phân loại phim.\n2. Trường hợp phim có nhiều cảnh diễn viên sử dụng thuốc lá theo đánh giá của Hội đồng thẩm định, phân loại phim thì việc phổ biến phim phải bảo đảm các yêu cầu sau đây:\na) Phim phải được phân loại theo tiêu chí và thực hiện mức phân loại phim, cảnh báo theo quy định tại Thông tư số 05/2023/TT-BVHTTDL ngày 05 tháng 4 năm 2023 của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch quy định tiêu chí phân loại phim và thực hiện hiển thị mức phân loại phim, cảnh báo.\nb) Có cảnh báo sức khỏe về tác hại của thuốc lá bằng chữ hoặc hình ảnh."
    },
    {
      "Điều 6: Trách nhiệm của tổ chức, cá nhân có liên quan": "1. Cục Điện ảnh, Cục Nghệ thuật biểu diễn căn cứ chức năng, nhiệm vụ, quyền hạn có trách nhiệm phối hợp với Vụ Pháp chế hướng dẫn, kiểm tra và tổ chức thực hiện Thông tư này trong phạm vi cả nước.\n2. Sở Văn hóa, Thể thao và Du lịch, Sở Văn hóa và Thể thao các tỉnh, thành phố trực thuộc trung ương có trách nhiệm tổ chức thực hiện Thông tư này tại địa phương.\n3. Tổ chức, cá nhân tổ chức biểu diễn nghệ thuật, sản xuất phim, phát hành phim, phổ biến phim, phân loại phim và các tổ chức, cá nhân khác có liên quan có trách nhiệm bảo đảm nội dung hạn chế sử dụng hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm điện ảnh, sân khấu theo quy định tại Thông tư này trong quá trình thực hiện công việc chuyên môn."
    },
    {
      "Điều 7: Hiệu lực thi hành": "1. Thông tư này có hiệu lực thi hành kể từ ngày 25 tháng 01 năm 2025.\n2. Thông tư số 25/2018/TT-BVHTTDL ngày 30 tháng 8 năm 2018 của Bộ trưởng Bộ Văn hóa, Thể thao và Du lịch quy định hạn chế hình ảnh diễn viên sử dụng thuốc lá trong tác phẩm sân khấu, điện ảnh hết hiệu lực thi hành kể từ ngày Thông tư này có hiệu lực.\nTrong quá trình thực hiện, nếu phát sinh vướng mắc, đề nghị các tổ chức, cá nhân kịp thời phản ánh về Bộ Văn hóa, Thể thao và Du lịch để nghiên cứu, sửa đổi, bổ sung cho phù hợp.\nBỘ TRƯỞNG\nNguyễn Văn Hùng"
    }
  ]
}

    let fullEmbedContent = []
  for (const item of document.content) {

    const articleTitle = Object.keys(item)[0]

    const articleContent = item[articleTitle]

    // text để embed
    const fullText = `
${document.info.lawNameDisplay}

${articleTitle}

${articleContent}
`

    const vector = await embed(fullText)


    
    fullEmbedContent.push({
      lawNumber:
        document.info.lawNumber,

      lawName:
        document.info.lawNameDisplay,

      lawKind:
        document.info.lawKind,

      article:
        articleTitle,

      content:
        articleContent,

      fullText,

      embedding:
        vector

    })    
}
return Response.json(fullEmbedContent)

}

