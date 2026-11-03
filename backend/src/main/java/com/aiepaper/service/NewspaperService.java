package com.aiepaper.service;

import com.aiepaper.entity.Newspaper;
import com.aiepaper.repository.NewspaperRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewspaperService {

    private final NewspaperRepository newspaperRepository;

    public Newspaper save(Newspaper newspaper) {
        return newspaperRepository.save(newspaper);
    }

    public List<Newspaper> getAllNewspapers() {
        return newspaperRepository.findAllByOrderByIdDesc();
    }
}
