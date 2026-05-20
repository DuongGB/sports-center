import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMountain } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon icon={faMountain} className="h-8 w-8" />
              <span className="font-bold text-2xl">D-Sport Center</span>
            </div>
            <p className="text-gray-400">
              Hệ thống đặt sân thể thao hàng đầu, mang đến trải nghiệm tiện lợi
              và chuyên nghiệp cho người yêu thể thao.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Đường dẫn nhanh</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Đặt sân
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Bảng giá
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
              <li>Điện thoại: (028) 1234 5678</li>
              <li>Email: contact@sportscenter.vn</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2026 D-Sport Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
